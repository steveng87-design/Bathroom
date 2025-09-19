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
        
        # Start building HTML content
        html_parts = [
            f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .quote-summary {{ background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }}
                    .cost-breakdown {{ margin: 20px 0; }}
                    .cost-item {{ display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }}
                    .total-cost {{ font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }}
                    .footer {{ background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🚿 Bathroom Quote Saver.AI</h1>
                    <p>Professional Bathroom Renovation Quote</p>
                </div>
                
                <div class="content">
                    <h2>Dear {client_name},</h2>
                    <p>Thank you for your interest in our bathroom renovation services. Please find your personalized quote below:</p>
                    
                    <div class="quote-summary">
                        <h3>📋 Project: {project_name}</h3>
                        <p><strong>Generated:</strong> {quote_data.get('created_at', 'Today')}</p>
                        <p><strong>AI-Powered Analysis:</strong> This quote was generated using advanced AI algorithms to ensure accuracy and competitive pricing.</p>
                    </div>
            """
        ]
        
        # Add cost information based on options
        if options.get('include_breakdown', True):
            # Include detailed breakdown
            html_parts.append("""
                    <div class="cost-breakdown">
                        <h3>💰 Detailed Cost Breakdown</h3>
            """)
            
            # Add component costs if available
            components = quote_data.get('components', {})
            if components:
                for component, cost in components.items():
                    component_name = component.replace('_', ' ').title()
                    html_parts.append(f"""
                        <div class="cost-item">
                            <span>{component_name}</span>
                            <span>${cost:,.2f}</span>
                        </div>
                    """)
            
            html_parts.append("</div>")
        
        # Add total cost
        html_parts.append(f"""
                    <div class="total-cost">
                        💵 Total Project Cost: ${total_cost:,.2f}
                    </div>
        """)
        
        # Add additional information
        html_parts.append(f"""
                    <div class="quote-summary">
                        <h3>🔧 What's Included:</h3>
                        <ul>
                            <li>✅ Professional consultation and planning</li>
                            <li>✅ High-quality materials and fixtures</li>
                            <li>✅ Expert installation and craftsmanship</li>
                            <li>✅ Project management and coordination</li>
                            <li>✅ Quality assurance and warranty</li>
                        </ul>
                    </div>
                    
                    <div class="quote-summary">
                        <h3>📞 Next Steps:</h3>
                        <p>This quote is valid for 30 days. To proceed with your bathroom renovation project, please contact us to discuss:</p>
                        <ul>
                            <li>🗓️ Project timeline and scheduling</li>
                            <li>🎨 Design options and material selections</li>
                            <li>📋 Permits and approvals (if required)</li>
                            <li>💳 Payment terms and options</li>
                        </ul>
                    </div>
                    
                    <p>We look forward to transforming your bathroom into the space of your dreams!</p>
                    
                    <p>Best regards,<br>
                    <strong>The Bathroom Quote Saver.AI Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>This quote was generated by Bathroom Quote Saver.AI - Powered by advanced AI technology</p>
                    <p>© 2025 Bathroom Quote Saver.AI. All rights reserved.</p>
                </div>
            </body>
            </html>
        """)
        
        return ''.join(html_parts)

# Global email service instance
email_service = EmailService()