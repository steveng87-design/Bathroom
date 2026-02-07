"""
Email Service for Bathroom Quote Saver.AI
Handles sending quotes and PDF attachments via SendGrid
"""

import os
import base64
from typing import Optional, Dict, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailDeliveryError(Exception):
    """Exception raised when email delivery fails."""
    pass

class EmailService:
    def __init__(self):
        self.api_key = os.getenv('SENDGRID_API_KEY')
        self.sender_email = os.getenv('SENDER_EMAIL')
        
        if not self.api_key:
            logger.warning("SENDGRID_API_KEY is not set. Email functionality will be disabled.")
        
        if not self.sender_email:
            logger.warning("SENDER_EMAIL is not set. Email functionality will be disabled.")
    
    def _is_configured(self) -> bool:
        """Check if email service is properly configured."""
        return bool(self.api_key and self.sender_email)
    
    def send_quote_email(
        self,
        recipient_email: str,
        client_name: str,
        quote_data: Dict[str, Any],
        options: Dict[str, bool],
        pdf_content: Optional[bytes] = None,
        pdf_filename: Optional[str] = None
    ) -> bool:
        """
        Send a quote email with optional PDF attachment and customizable content.
        
        Args:
            recipient_email: Recipient's email address
            client_name: Client's name
            quote_data: Dictionary containing quote information
            options: Dictionary with email options:
                - include_breakdown: bool - Include detailed cost breakdown
                - include_pdf: bool - Include PDF attachment
            pdf_content: PDF file content as bytes (optional)
            pdf_filename: Name for the PDF attachment (optional)
        
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self._is_configured():
            raise EmailDeliveryError("Email service is not configured. Please set SENDGRID_API_KEY and SENDER_EMAIL.")
        
        try:
            # Generate email content based on options
            subject = f"Bathroom Renovation Quote - {client_name}"
            html_content = self._generate_email_content(client_name, quote_data, options)
            
            # Create the email message
            message = Mail(
                from_email=self.sender_email,
                to_emails=recipient_email,
                subject=subject,
                html_content=html_content
            )
            
            # Add PDF attachment if requested and provided
            if options.get('include_pdf', False) and pdf_content and pdf_filename:
                encoded_file = base64.b64encode(pdf_content).decode()
                
                attachment = Attachment(
                    FileContent(encoded_file),
                    FileName(pdf_filename),
                    FileType("application/pdf"),
                    Disposition("attachment")
                )
                message.attachment = attachment
            
            # Send the email
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            
            if response.status_code == 202:
                logger.info(f"Quote email sent successfully to {recipient_email}")
                return True
            else:
                logger.error(f"Failed to send email. Status code: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending quote email: {str(e)}")
            raise EmailDeliveryError(f"Failed to send email: {str(e)}")
    
    def _generate_email_content(
        self,
        client_name: str,
        quote_data: Dict[str, Any],
        options: Dict[str, bool]
    ) -> str:
        """
        Generate HTML email content based on quote data and options.
        
        Args:
            client_name: Client's name
            quote_data: Quote information
            options: Email content options
        
        Returns:
            str: HTML email content
        """
        total_cost = quote_data.get('total_cost', 0)
        project_name = quote_data.get('project_name', 'Bathroom Renovation')
        
        html_parts = [
            f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                    .header h1 {{ margin: 0; font-size: 24px; }}
                    .content {{ background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }}
                    .quote-summary {{ background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1e40af; }}
                    .total-cost {{ font-size: 28px; font-weight: bold; color: #059669; text-align: center; margin: 25px 0; }}
                    .footer {{ background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Bathroom Quote Saver.AI</h1>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">Professional Bathroom Renovation Quote</p>
                </div>
                
                <div class="content">
                    <p>Dear {client_name},</p>
                    
                    <p>Please find the attached scope of works and quotation for your bathroom renovation project.</p>
                    
                    <div class="quote-summary">
                        <p style="margin: 0;"><strong>Project:</strong> {project_name}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Quote Date:</strong> {quote_data.get('created_at', 'Today')}</p>
                    </div>
            """
        ]
        
        # Add cost breakdown if requested
        if options.get('include_breakdown', True):
            components = quote_data.get('components', {})
            if components:
                html_parts.append("""
                    <div style="margin: 20px 0;">
                        <p><strong>Cost Breakdown:</strong></p>
                        <table style="width: 100%; border-collapse: collapse;">
                """)
                
                for component, cost in components.items():
                    component_name = component.replace('_', ' ').title()
                    html_parts.append(f"""
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">{component_name}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${cost:,.2f}</td>
                        </tr>
                    """)
                
                html_parts.append("</table></div>")
        
        # Add total cost
        html_parts.append(f"""
                    <div class="total-cost">
                        Total Project Cost: ${total_cost:,.2f}
                    </div>
                    
                    <p>This quote is valid for 30 days from the date of issue. If you have any questions or would like to discuss any aspect of this quotation, please feel free to reach out. We are happy to help.</p>
                    
                    <p>Kind regards,<br/>
                    <strong>The Bathroom Quote Saver.AI Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This quote was generated by Bathroom Quote Saver.AI</p>
                </div>
            </body>
            </html>
        """)
        
        return ''.join(html_parts)

# Global email service instance
email_service = EmailService()
