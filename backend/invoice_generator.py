"""
Invoice Generator for Bathroom Quote Saver.AI
Generates professional tax invoices for progress claims and manual invoicing
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime, timedelta
from typing import Dict, Any, Optional


class InvoiceGenerator:
    """Generates professional tax invoices for bathroom renovation projects"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for invoices"""
        self.styles.add(ParagraphStyle(
            name='InvoiceTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a365d'),
            spaceAfter=5,
            alignment=TA_RIGHT,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='InvoiceSubtitle',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#4a5568'),
            alignment=TA_RIGHT,
            spaceAfter=20
        ))
        
        self.styles.add(ParagraphStyle(
            name='CompanyName',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=2,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='CompanyDetails',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#4a5568'),
            spaceAfter=2,
            leading=12
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=11,
            textColor=colors.HexColor('#1a365d'),
            spaceAfter=8,
            spaceBefore=15,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='InvoiceBody',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=14,
            spaceAfter=6
        ))
        
        self.styles.add(ParagraphStyle(
            name='TotalAmount',
            parent=self.styles['Normal'],
            fontSize=14,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#059669'),
            alignment=TA_RIGHT
        ))
        
        self.styles.add(ParagraphStyle(
            name='BankDetails',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#374151'),
            leading=14,
            spaceAfter=4
        ))
        
        self.styles.add(ParagraphStyle(
            name='FooterText',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#6b7280'),
            alignment=TA_CENTER
        ))
    
    def generate_invoice(self, invoice_data: Dict[str, Any]) -> BytesIO:
        """
        Generate a professional tax invoice PDF
        
        Args:
            invoice_data: Dictionary containing all invoice information
                - invoice_number: Unique invoice number (e.g., INV-2026-001)
                - invoice_date: Date of invoice
                - due_date: Payment due date
                - contractor_info: Business details (name, abn, address, phone, email)
                - bank_details: Bank account info (bank_name, bsb, account_number, account_name)
                - client_info: Client details (name, email, phone, address)
                - contract_number: Related contract number (optional)
                - project_address: Site address
                - payment_stage: Stage description (e.g., "Stage 2 - Demolition & Rough-in")
                - stage_percentage: Percentage of total (e.g., 40)
                - line_items: List of work items with descriptions and amounts
                - subtotal: Amount before GST
                - gst_amount: GST (10%)
                - total_amount: Total including GST
                - notes: Additional notes (optional)
        
        Returns:
            BytesIO buffer containing the PDF
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )
        
        story = []
        
        # Header Section - Company Info and Invoice Title side by side
        contractor = invoice_data.get('contractor_info', {})
        
        # Create header table with company info on left, invoice details on right
        header_data = [
            [
                Paragraph(contractor.get('contractor_name', 'Business Name'), self.styles['CompanyName']),
                Paragraph("TAX INVOICE", self.styles['InvoiceTitle'])
            ],
            [
                Paragraph(f"ABN: {contractor.get('contractor_abn', 'XX XXX XXX XXX')}", self.styles['CompanyDetails']),
                Paragraph(f"Invoice No: {invoice_data.get('invoice_number', 'INV-000')}", self.styles['InvoiceSubtitle'])
            ],
            [
                Paragraph(f"License: {contractor.get('contractor_license', 'XXXXXX')}", self.styles['CompanyDetails']),
                Paragraph(f"Date: {invoice_data.get('invoice_date', datetime.now().strftime('%d/%m/%Y'))}", self.styles['InvoiceSubtitle'])
            ],
            [
                Paragraph(contractor.get('contractor_address', ''), self.styles['CompanyDetails']),
                Paragraph(f"Due Date: {invoice_data.get('due_date', '')}", self.styles['InvoiceSubtitle'])
            ],
            [
                Paragraph(f"Phone: {contractor.get('contractor_phone', '')}", self.styles['CompanyDetails']),
                ''
            ],
            [
                Paragraph(f"Email: {contractor.get('contractor_email', '')}", self.styles['CompanyDetails']),
                ''
            ]
        ]
        
        header_table = Table(header_data, colWidths=[100*mm, 70*mm])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 10*mm))
        
        # Divider line
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))
        story.append(Spacer(1, 8*mm))
        
        # Bill To Section
        client = invoice_data.get('client_info', {})
        story.append(Paragraph("BILL TO:", self.styles['SectionHeader']))
        
        bill_to_text = f"""
        {client.get('name', 'Client Name')}<br/>
        {client.get('address', 'Client Address')}<br/>
        Phone: {client.get('phone', '')}<br/>
        Email: {client.get('email', '')}
        """
        story.append(Paragraph(bill_to_text, self.styles['InvoiceBody']))
        story.append(Spacer(1, 5*mm))
        
        # Project Details
        story.append(Paragraph("PROJECT DETAILS:", self.styles['SectionHeader']))
        
        contract_num = invoice_data.get('contract_number', '')
        project_details = f"""
        Project Address: {invoice_data.get('project_address', client.get('address', 'N/A'))}<br/>
        {f'Contract Reference: {contract_num}<br/>' if contract_num else ''}
        Payment Stage: {invoice_data.get('payment_stage', 'Progress Claim')}
        {f" ({invoice_data.get('stage_percentage', '')}%)" if invoice_data.get('stage_percentage') else ''}
        """
        story.append(Paragraph(project_details, self.styles['InvoiceBody']))
        story.append(Spacer(1, 8*mm))
        
        # Line Items Table
        story.append(Paragraph("INVOICE DETAILS:", self.styles['SectionHeader']))
        
        # Build line items table
        line_items = invoice_data.get('line_items', [])
        table_data = [['Description', 'Amount']]
        
        for item in line_items:
            table_data.append([
                item.get('description', ''),
                f"${item.get('amount', 0):,.2f}"
            ])
        
        # Add subtotal, GST, and total rows
        table_data.append(['', ''])  # Spacer row
        table_data.append(['Subtotal (excl. GST)', f"${invoice_data.get('subtotal', 0):,.2f}"])
        table_data.append(['GST (10%)', f"${invoice_data.get('gst_amount', 0):,.2f}"])
        table_data.append(['TOTAL AMOUNT DUE', f"${invoice_data.get('total_amount', 0):,.2f}"])
        
        items_table = Table(table_data, colWidths=[120*mm, 50*mm])
        items_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            
            # Data rows
            ('FONTSIZE', (0, 1), (-1, -4), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -4), 8),
            ('TOPPADDING', (0, 1), (-1, -4), 8),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            
            # Subtotal row
            ('FONTNAME', (0, -3), (-1, -3), 'Helvetica'),
            ('LINEABOVE', (0, -3), (-1, -3), 1, colors.HexColor('#e5e7eb')),
            ('TOPPADDING', (0, -3), (-1, -3), 10),
            
            # GST row
            ('FONTNAME', (0, -2), (-1, -2), 'Helvetica'),
            
            # Total row
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f0fdf4')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('TEXTCOLOR', (1, -1), (1, -1), colors.HexColor('#059669')),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 12),
            ('TOPPADDING', (0, -1), (-1, -1), 12),
            
            # Grid for data rows only
            ('GRID', (0, 0), (-1, -4), 0.5, colors.HexColor('#e5e7eb')),
            ('BOX', (0, -3), (-1, -1), 1, colors.HexColor('#d1d5db')),
        ]))
        
        story.append(items_table)
        story.append(Spacer(1, 10*mm))
        
        # Payment Details Section
        story.append(Paragraph("PAYMENT DETAILS:", self.styles['SectionHeader']))
        
        bank = invoice_data.get('bank_details', {})
        bank_details_text = f"""
        Please transfer payment to the following account:<br/><br/>
        <b>Bank:</b> {bank.get('bank_name', 'Bank Name')}<br/>
        <b>Account Name:</b> {bank.get('account_name', 'Account Name')}<br/>
        <b>BSB:</b> {bank.get('bsb', 'XXX-XXX')}<br/>
        <b>Account Number:</b> {bank.get('account_number', 'XXXXXXXX')}<br/><br/>
        <b>Reference:</b> {invoice_data.get('invoice_number', 'INV-000')}
        """
        story.append(Paragraph(bank_details_text, self.styles['BankDetails']))
        story.append(Spacer(1, 8*mm))
        
        # Notes section (if any)
        notes = invoice_data.get('notes', '')
        if notes:
            story.append(Paragraph("NOTES:", self.styles['SectionHeader']))
            story.append(Paragraph(notes, self.styles['InvoiceBody']))
            story.append(Spacer(1, 8*mm))
        
        # Footer
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e5e7eb')))
        story.append(Spacer(1, 5*mm))
        
        footer_text = f"""
        Thank you for your business.<br/>
        Payment is due within {invoice_data.get('payment_terms', 14)} days of invoice date.<br/>
        Please include the invoice number as your payment reference.
        """
        story.append(Paragraph(footer_text, self.styles['FooterText']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer


def calculate_invoice_amounts(base_amount: float, include_gst: bool = True) -> Dict[str, float]:
    """
    Calculate invoice amounts including GST
    
    Args:
        base_amount: The base amount (can be GST inclusive or exclusive)
        include_gst: If True, base_amount includes GST. If False, GST will be added.
    
    Returns:
        Dictionary with subtotal, gst_amount, and total_amount
    """
    if include_gst:
        # Base amount includes GST - extract it
        subtotal = round(base_amount / 1.1, 2)
        gst_amount = round(base_amount - subtotal, 2)
        total_amount = base_amount
    else:
        # Base amount excludes GST - add it
        subtotal = base_amount
        gst_amount = round(base_amount * 0.1, 2)
        total_amount = round(subtotal + gst_amount, 2)
    
    return {
        'subtotal': subtotal,
        'gst_amount': gst_amount,
        'total_amount': total_amount
    }


def generate_invoice_number(year: int, sequence: int) -> str:
    """Generate a formatted invoice number"""
    return f"INV-{year}-{sequence:03d}"
