package com.parcelgo.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${resend.verified-email:}")
    private String resendVerifiedEmail;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone-number:}")
    private String twilioPhoneNumber;

    @Value("${fast2sms.api-key:}")
    private String fast2smsApiKey;

    private boolean twilioEnabled = false;

    @PostConstruct
    public void init() {
        if (!twilioAccountSid.isBlank() && !twilioAuthToken.isBlank() && !twilioPhoneNumber.isBlank()) {
            try {
                Twilio.init(twilioAccountSid, twilioAuthToken);
                twilioEnabled = true;
                log.info("Twilio SMS notifications enabled");
            } catch (Exception e) {
                log.warn("Failed to initialize Twilio: {}", e.getMessage());
            }
        }
        if (!resendApiKey.isBlank()) {
            log.info("Resend email notifications enabled");
        }
    }

    @Async
    public void sendStatusUpdateEmail(String toEmail, String customerName, String trackingId,
                                       String status, String pickupAddress, String dropAddress,
                                       String agentName) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            log.info("Resend not configured — skipping email for order {}", trackingId);
            return;
        }

        String statusLabel = status.replace("_", " ");
        StringBuilder body = new StringBuilder();
        body.append("Hello ").append(customerName).append(",\n\n");
        body.append("Your order ").append(trackingId).append(" has been updated.\n\n");
        body.append("Status: ").append(statusLabel).append("\n");
        body.append("From: ").append(pickupAddress).append("\n");
        body.append("To: ").append(dropAddress).append("\n");
        if (agentName != null) body.append("Delivery Agent: ").append(agentName).append("\n");
        if ("FAILED".equals(status)) {
            body.append("\nDelivery was unsuccessful. Please log in to ParcelGo to reschedule.\n");
        }
        body.append("\nThank you,\nParcelGo Team\n");

        sendEmailViaResend(toEmail,
            "ParcelGo: Order " + trackingId + " — " + statusLabel,
            body.toString(), trackingId);
    }

    @Async
    public void sendStatusUpdateSms(String phone, String trackingId, String status) {
        if (fast2smsApiKey == null || fast2smsApiKey.isBlank() || phone == null || phone.isBlank()) return;
        String statusLabel = status.replace("_", " ");
        String body = "ParcelGo order " + trackingId + " is now " + statusLabel + "."
            + (status.equals("FAILED") ? " Please login to reschedule." : "");
        sendSmsFast2Sms(phone, body, trackingId);
    }

    @Async
    public void sendRescheduleEmail(String toEmail, String customerName, String trackingId, String newDate) {
        if (resendApiKey == null || resendApiKey.isBlank()) return;
        String body = "Hello " + customerName + ",\n\n"
            + "Your delivery " + trackingId + " has been rescheduled to " + newDate + ".\n"
            + "A delivery agent will be assigned shortly.\n\n"
            + "Thank you,\nParcelGo Team";
        sendEmailViaResend(toEmail, "ParcelGo: Delivery rescheduled — " + trackingId, body, trackingId);
    }

    @Async
    public void sendRescheduleSms(String phone, String trackingId, String newDate) {
        if (fast2smsApiKey == null || fast2smsApiKey.isBlank() || phone == null || phone.isBlank()) return;
        String body = "ParcelGo order " + trackingId + " rescheduled for " + newDate + ".";
        sendSmsFast2Sms(phone, body, trackingId);
    }

    private void sendEmailViaResend(String toEmail, String subject, String textBody, String trackingId) {
        try {
            // Resend free tier only allows sending to verified email (smritiprajapati15@gmail.com)
            // With a verified domain, change 'from' to use that domain and remove this override
            String recipient = (resendVerifiedEmail != null && !resendVerifiedEmail.isBlank())
                ? resendVerifiedEmail  // always deliver to verified email on free tier
                : toEmail;

            String json = "{"
                + "\"from\":\"ParcelGo <onboarding@resend.dev>\","
                + "\"to\":[\"" + recipient + "\"],"
                + "\"subject\":\"" + subject + "\","
                + "\"text\":\"" + textBody.replace("\n", "\\n").replace("\"", "\\\"") + "\""
                + "}";

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + resendApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                log.info("Email sent to {} for order {}", recipient, trackingId);
            } else {
                log.error("Email failed for order {}: {}", trackingId, response.body());
            }
        } catch (Exception e) {
            log.error("Email failed for order {}: {}", trackingId, e.getMessage());
        }
    }

    private void sendSmsFast2Sms(String toPhone, String body, String trackingId) {
        try {
            String normalized = toPhone.trim().replaceAll("[^0-9]", "");
            if (normalized.startsWith("91") && normalized.length() == 12) normalized = normalized.substring(2);
            if (normalized.length() != 10) { log.warn("Invalid phone: {}", toPhone); return; }

            String payload = "{\"message\":\"" + body + "\",\"route\":\"q\",\"numbers\":\"" + normalized + "\",\"flash\":\"0\"}";
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://www.fast2sms.com/dev/bulkV2"))
                .header("authorization", fast2smsApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) log.info("SMS sent to {} for order {}", normalized, trackingId);
            else log.error("SMS failed for order {}: {}", trackingId, response.body());
        } catch (Exception e) {
            log.error("SMS failed for order {}: {}", trackingId, e.getMessage());
        }
    }
}
