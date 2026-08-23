package com.parcelgo.service;

import com.parcelgo.model.Order;
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

    @Async
    public void sendStatusUpdateEmail(Order order, String previousStatus) {
        if (mailSender == null || mailUsername == null || mailUsername.isBlank()) {
            log.info("Email not configured — skipping for order {}", order.getTrackingId());
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(order.getCustomer().getEmail());
            message.setSubject("ParcelGo: Order " + order.getTrackingId() + " — " + formatStatus(order.getStatus().name()));
            message.setText(buildEmailBody(order));
            mailSender.send(message);
            log.info("Email sent to {} for order {}", order.getCustomer().getEmail(), order.getTrackingId());
        } catch (Exception e) {
            log.error("Email failed for order {}: {}", order.getTrackingId(), e.getMessage());
        }
    }

    @Async
    public void sendStatusUpdateSms(Order order) {
        if (!twilioEnabled) return;
        String phone = order.getCustomer().getPhone();
        if (phone == null || phone.isBlank()) return;

        String smsBody = buildSmsBody(order);
        sendSms(phone, smsBody, order.getTrackingId());
    }

    @Async
    public void sendRescheduleConfirmation(Order order) {
        String subject = "ParcelGo: Delivery rescheduled — " + order.getTrackingId();
        String body = "Hello " + order.getCustomer().getName() + ",\n\n"
            + "Your delivery has been rescheduled to " + order.getScheduledDate() + ".\n"
            + "Tracking ID: " + order.getTrackingId() + "\n\n"
            + "Thank you,\nParcelGo Team";

        if (mailSender != null && mailUsername != null && !mailUsername.isBlank()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(order.getCustomer().getEmail());
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
            } catch (Exception e) {
                log.error("Reschedule email failed for {}: {}", order.getTrackingId(), e.getMessage());
            }
        }

        if (twilioEnabled) {
            String phone = order.getCustomer().getPhone();
            if (phone != null && !phone.isBlank()) {
                String sms = "ParcelGo: Your delivery " + order.getTrackingId()
                    + " is rescheduled for " + order.getScheduledDate() + ". A new agent will be assigned.";
                sendSms(phone, sms, order.getTrackingId());
            }
        }
    }

    private void sendSms(String toPhone, String body, String trackingId) {
        try {
            // Normalize Indian phone numbers to E.164 format
            String normalized = toPhone.trim().replaceAll("[\\s\\-()]", "");
            if (normalized.length() == 10 && !normalized.startsWith("+")) {
                normalized = "+91" + normalized;
            } else if (!normalized.startsWith("+")) {
                normalized = "+" + normalized;
            }

            Message.creator(
                new PhoneNumber(normalized),
                new PhoneNumber(twilioPhoneNumber),
                body
            ).create();

            log.info("SMS sent to {} for order {}", normalized, trackingId);
        } catch (Exception e) {
            log.error("SMS failed for order {}: {}", trackingId, e.getMessage());
        }
    }

    private String buildEmailBody(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(order.getCustomer().getName()).append(",\n\n");
        sb.append("Your order ").append(order.getTrackingId()).append(" has been updated.\n\n");
        sb.append("Status: ").append(formatStatus(order.getStatus().name())).append("\n");
        sb.append("From: ").append(order.getPickupAddress()).append("\n");
        sb.append("To: ").append(order.getDropAddress()).append("\n");
        if (order.getAgent() != null) {
            sb.append("Delivery Agent: ").append(order.getAgent().getUser().getName()).append("\n");
        }
        if (order.getStatus() == Order.OrderStatus.FAILED) {
            sb.append("\nDelivery was unsuccessful. Please log in to ParcelGo to reschedule.\n");
        }
        sb.append("\nThank you,\nParcelGo Team\n");
        return sb.toString();
    }

    private String buildSmsBody(Order order) {
        String status = formatStatus(order.getStatus().name());
        String sms = "ParcelGo: Order " + order.getTrackingId() + " is now " + status + ".";
        if (order.getStatus() == Order.OrderStatus.FAILED) {
            sms += " Please reschedule your delivery at parcelgo.in";
        } else if (order.getStatus() == Order.OrderStatus.OUT_FOR_DELIVERY) {
            sms += " Your agent is on the way!";
        } else if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            sms += " Thank you for choosing ParcelGo!";
        }
        return sms;
    }

    private String formatStatus(String status) {
        return status.replace("_", " ");
    }
}
