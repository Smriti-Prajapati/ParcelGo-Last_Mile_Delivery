package com.parcelgo.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@parcelgo.in}")
    private String fromEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

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
        } else {
            log.info("Twilio not configured — SMS notifications disabled");
        }
    }

    // All parameters are primitive types — no lazy-loaded entities
    @Async
    public void sendStatusUpdateEmail(String toEmail, String customerName, String trackingId,
                                       String status, String pickupAddress, String dropAddress,
                                       String agentName) {
        if (mailSender == null || mailUsername == null || mailUsername.isBlank()) return;

        try {
            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(customerName).append(",\n\n");
            body.append("Your order ").append(trackingId).append(" has been updated.\n\n");
            body.append("Status: ").append(status.replace("_", " ")).append("\n");
            body.append("From: ").append(pickupAddress).append("\n");
            body.append("To: ").append(dropAddress).append("\n");
            if (agentName != null) body.append("Delivery Agent: ").append(agentName).append("\n");
            if ("FAILED".equals(status)) {
                body.append("\nDelivery was unsuccessful. Please log in to ParcelGo to reschedule.\n");
            }
            body.append("\nThank you,\nParcelGo Team\n");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ParcelGo: Order " + trackingId + " — " + status.replace("_", " "));
            message.setText(body.toString());
            mailSender.send(message);
            log.info("Email sent to {} for order {}", toEmail, trackingId);
        } catch (Exception e) {
            log.error("Email failed for order {}: {}", trackingId, e.getMessage());
        }
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
        if (mailSender == null || mailUsername == null || mailUsername.isBlank()) return;
        try {
            String body = "Hello " + customerName + ",\n\n"
                + "Your delivery " + trackingId + " has been rescheduled to " + newDate + ".\n"
                + "A delivery agent will be assigned shortly.\n\n"
                + "Thank you,\nParcelGo Team";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("ParcelGo: Delivery rescheduled — " + trackingId);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Reschedule email failed for {}: {}", trackingId, e.getMessage());
        }
    }

    @Async
    public void sendRescheduleSms(String phone, String trackingId, String newDate) {
        if (fast2smsApiKey == null || fast2smsApiKey.isBlank() || phone == null || phone.isBlank()) return;
        String body = "ParcelGo order " + trackingId + " rescheduled for " + newDate + ".";
        sendSmsFast2Sms(phone, body, trackingId);
    }

    private void sendSmsFast2Sms(String toPhone, String body, String trackingId) {
        try {
            String normalized = toPhone.trim().replaceAll("[^0-9]", "");
            if (normalized.startsWith("91") && normalized.length() == 12) {
                normalized = normalized.substring(2);
            }
            if (normalized.length() != 10) {
                log.warn("Invalid phone number for SMS: {}", toPhone);
                return;
            }

            String url = "https://www.fast2sms.com/dev/bulkV2";
            String payload = "{\"message\":\"" + body + "\",\"route\":\"q\",\"numbers\":\"" + normalized + "\",\"flash\":\"0\"}";

            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(url))
                .header("authorization", fast2smsApiKey)
                .header("Content-Type", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(payload))
                .build();

            java.net.http.HttpResponse<String> response = client.send(request,
                java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                log.info("SMS sent to {} for order {}", normalized, trackingId);
            } else {
                log.error("SMS failed for order {}: {}", trackingId, response.body());
            }
        } catch (Exception e) {
            log.error("SMS failed for order {}: {}", trackingId, e.getMessage());
        }
    }

    private void sendSms(String toPhone, String body, String trackingId) {
        try {
            String normalized = toPhone.trim().replaceAll("[\\s\\-()]", "");
            if (normalized.length() == 10 && !normalized.startsWith("+")) {
                normalized = "+91" + normalized;
            } else if (!normalized.startsWith("+")) {
                normalized = "+" + normalized;
            }
            Message.creator(new PhoneNumber(normalized), new PhoneNumber(twilioPhoneNumber), body).create();
            log.info("SMS sent to {} for order {}", normalized, trackingId);
        } catch (Exception e) {
            log.error("SMS failed for order {}: {}", trackingId, e.getMessage());
        }
    }
}
