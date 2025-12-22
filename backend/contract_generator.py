"""
Contract Generator for Australian Bathroom Renovation Contracts
Generates legally compliant contracts with NSW-based terms and conditions
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime, timedelta
import uuid


class ContractGenerator:
    """Generates professional bathroom renovation contracts"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for the contract"""
        self.styles.add(ParagraphStyle(
            name='ContractTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1a365d'),
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeading',
            parent=self.styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#2d3748'),
            spaceAfter=8,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='ClauseHeading',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#1a202c'),
            spaceAfter=6,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='ContractBody',
            parent=self.styles['Normal'],
            fontSize=9,
            leading=12,
            alignment=TA_JUSTIFY,
            spaceAfter=8
        ))
        
        self.styles.add(ParagraphStyle(
            name='SignatureText',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6
        ))
    
    def generate_contract(self, contract_data):
        """
        Generate a complete contract PDF
        
        Args:
            contract_data: Dictionary containing all contract information
                - contract_id: Unique contract identifier
                - contractor_name: Business/contractor name
                - contractor_abn: ABN number
                - contractor_license: Builder's license number
                - contractor_address: Business address
                - contractor_email: Contact email
                - contractor_phone: Contact phone
                - contractor_signature: Base64 signature image (optional)
                - client_name: Client full name
                - client_email: Client email
                - client_phone: Client phone
                - client_address: Project/client address
                - project_description: Description of works
                - scope_of_works: List of work items
                - total_price: Total contract price
                - payment_schedule: Payment breakdown
                - start_date: Project start date
                - completion_days: Number of days to complete
                - gst_included: Whether GST is included
        
        Returns:
            BytesIO buffer containing the PDF
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=15*mm,
            bottomMargin=15*mm
        )
        
        story = []
        
        # Contract Header
        story.append(Paragraph("BATHROOM RENOVATION CONTRACT", self.styles['ContractTitle']))
        story.append(Paragraph("Australian Building Industry Standard", self.styles['ContractBody']))
        story.append(Spacer(1, 10*mm))
        
        # Contract Reference
        contract_ref = f"Contract No: {contract_data.get('contract_id', 'N/A')}"
        story.append(Paragraph(contract_ref, self.styles['ContractBody']))
        story.append(Paragraph(f"Date: {datetime.now().strftime('%d %B %Y')}", self.styles['ContractBody']))
        story.append(Spacer(1, 8*mm))
        
        # Parties Section
        story.append(Paragraph("SCHEDULE 1 - CONTRACT PARTICULARS", self.styles['SectionHeading']))
        
        # Item 1: The Contractor
        story.append(Paragraph("1. THE CONTRACTOR", self.styles['ClauseHeading']))
        contractor_details = f"""
        Business Name: {contract_data.get('contractor_name', 'N/A')}<br/>
        ABN: {contract_data.get('contractor_abn', 'N/A')}<br/>
        License Number: {contract_data.get('contractor_license', 'N/A')}<br/>
        Address: {contract_data.get('contractor_address', 'N/A')}<br/>
        Email: {contract_data.get('contractor_email', 'N/A')}<br/>
        Phone: {contract_data.get('contractor_phone', 'N/A')}
        """
        story.append(Paragraph(contractor_details, self.styles['ContractBody']))
        story.append(Spacer(1, 3*mm))
        
        # Item 2: The Client
        story.append(Paragraph("2. THE CLIENT", self.styles['ClauseHeading']))
        client_details = f"""
        Name: {contract_data.get('client_name', 'N/A')}<br/>
        Email: {contract_data.get('client_email', 'N/A')}<br/>
        Phone: {contract_data.get('client_phone', 'N/A')}
        """
        story.append(Paragraph(client_details, self.styles['ContractBody']))
        story.append(Spacer(1, 3*mm))
        
        # Item 3: The Site
        story.append(Paragraph("3. THE SITE", self.styles['ClauseHeading']))
        story.append(Paragraph(f"Address: {contract_data.get('client_address', 'N/A')}", self.styles['ContractBody']))
        story.append(Spacer(1, 3*mm))
        
        # Item 4: Description of Works
        story.append(Paragraph("4. DESCRIPTION OF WORKS", self.styles['ClauseHeading']))
        
        # Simple description instead of table
        works_description = contract_data.get('project_description', 'Complete bathroom renovation')
        story.append(Paragraph(works_description, self.styles['ContractBody']))
        story.append(Spacer(1, 3*mm))
        
        # Item 5: Payment Schedule
        story.append(Paragraph("5. CONTRACT PRICE AND PAYMENT SCHEDULE", self.styles['ClauseHeading']))
        
        total_price = contract_data.get('total_price', 0)
        gst_note = " (GST Included)" if contract_data.get('gst_included', True) else " (GST Exclusive)"
        
        story.append(Paragraph(f"<b>Total Contract Price: ${total_price:,.2f}{gst_note}</b>", self.styles['ContractBody']))
        story.append(Spacer(1, 3*mm))
        
        # Payment schedule table
        payment_schedule = contract_data.get('payment_schedule', [])
        if payment_schedule:
            payment_data = [['Stage', 'Description', 'Amount', 'Percentage']]
            for payment in payment_schedule:
                payment_data.append([
                    payment.get('stage', ''),
                    payment.get('description', ''),
                    f"${payment.get('amount', 0):,.2f}",
                    f"{payment.get('percentage', 0)}%"
                ])
            
            payment_table = Table(payment_data, colWidths=[20*mm, 100*mm, 30*mm, 25*mm])
            payment_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (2, 0), (3, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7fafc')])
            ]))
            story.append(payment_table)
            story.append(Spacer(1, 3*mm))
        
        # Item 6: Project Timeline
        story.append(Paragraph("6. PROJECT TIMELINE", self.styles['ClauseHeading']))
        start_date = contract_data.get('start_date', datetime.now())
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        
        completion_days = contract_data.get('completion_days', 30)
        completion_date = start_date + timedelta(days=completion_days)
        
        timeline_text = f"""
        Commencement Date: {start_date.strftime('%d %B %Y')}<br/>
        Completion Period: {completion_days} working days<br/>
        Expected Completion: {completion_date.strftime('%d %B %Y')}
        """
        story.append(Paragraph(timeline_text, self.styles['ContractBody']))
        story.append(Spacer(1, 5*mm))
        
        # Start new page for terms and conditions
        story.append(PageBreak())
        
        # Terms and Conditions
        story.append(Paragraph("TERMS AND CONDITIONS OF CONTRACT", self.styles['SectionHeading']))
        story.append(Spacer(1, 5*mm))
        
        # Add all T&Cs (reworded to avoid copyright)
        terms = self._get_contract_terms()
        for term in terms:
            story.append(Paragraph(term['heading'], self.styles['ClauseHeading']))
            story.append(Paragraph(term['content'], self.styles['ContractBody']))
            story.append(Spacer(1, 3*mm))
        
        # Signature Page
        story.append(PageBreak())
        story.append(Paragraph("AGREEMENT AND SIGNATURES", self.styles['SectionHeading']))
        story.append(Spacer(1, 5*mm))
        
        agreement_text = """
        By signing below, both parties acknowledge that they have read, understood, and agree to be bound 
        by all terms and conditions of this contract, including all schedules and attachments.
        """
        story.append(Paragraph(agreement_text, self.styles['ContractBody']))
        story.append(Spacer(1, 10*mm))
        
        # Signature blocks
        sig_data = [
            ['', ''],
            ['CONTRACTOR', 'CLIENT'],
            ['', ''],
            [f"Name: {contract_data.get('contractor_name', '')}", f"Name: {contract_data.get('client_name', '')}"],
            ['', ''],
            ['Signature: _______________________', 'Signature: _______________________'],
            ['', ''],
            ['Date: ___________________________', 'Date: ___________________________']
        ]
        
        sig_table = Table(sig_data, colWidths=[85*mm, 85*mm])
        sig_table.setStyle(TableStyle([
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8)
        ]))
        story.append(sig_table)
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def _get_contract_terms(self):
        """
        Returns reworded terms and conditions for Australian bathroom contracts
        Based on NSW HIA template but reworded to avoid copyright infringement
        """
        return [
            {
                'heading': '1. CONTRACTOR OBLIGATIONS',
                'content': '''1.1 The Contractor agrees to: (a) provide and supply all materials and products as specified; 
                (b) complete installation of all products at the designated site; (c) execute all works in accordance 
                with this agreement and applicable Australian Standards.'''
            },
            {
                'heading': '2. PAYMENT TERMS',
                'content': '''2.1 The Client shall remit payment to the Contractor according to the staged payment schedule 
                outlined in Schedule 1, Item 5. 2.2 Progress claims shall be submitted in writing upon completion of each 
                designated stage. 2.3 Payment for completed stages must be made within 5 business days of claim submission. 
                2.4 Additional costs incurred beyond the scope of scheduled payments shall be due upon demand after work 
                completion or cost incurrence.'''
            },
            {
                'heading': '3. SITE ACCESS AND FACILITIES',
                'content': '''3.1 The Client must: (a) provide unrestricted site access during standard business hours for 
                measurement, delivery, installation, and defect rectification; (b) ensure access to water, electricity, 
                and sanitary facilities while Contractor is on-site; (c) maintain control of domestic animals for safety. 
                3.2 Failure to provide access within 7 days of request entitles the Contractor to claim payment for 
                completed work and costs incurred.'''
            },
            {
                'heading': '4. MEASUREMENTS AND VERIFICATION',
                'content': '''4.1 The Contractor will conduct site measurements on the specified measurement date. 
                4.2 Minor modifications to plans may be made to conform with actual measurements, with Client notification. 
                4.3 Significant changes required due to measurement discrepancies shall be treated as variations under Clause 11.'''
            },
            {
                'heading': '5. WARRANTY PROVISIONS',
                'content': '''5.1 Subject to statutory rights, the Contractor warrants that: (a) all workmanship; and 
                (b) materials supplied, will meet industry standards and be free from defects at installation completion. 
                5.2 This warranty excludes: (a) damage from misuse, wear, or natural movement; (b) manufacturer defects 
                beyond warranty period; (c) defects in Client-supplied materials or work.'''
            },
            {
                'heading': '6. DEFECT RECTIFICATION RIGHTS',
                'content': '''6.1 The Client must notify the Contractor in writing of any claimed defects promptly. 
                6.2 Delayed notification may absolve the Contractor of responsibility for consequential damage. 
                6.3 Upon accepting responsibility, the Contractor has 28 days to rectify defects. Safety-critical 
                defects will be addressed with priority. Client must provide access as per Clause 3.'''
            },
            {
                'heading': '7. MATERIAL COLOR VARIATION',
                'content': '''7.1 The Client acknowledges natural variation in color and grain of timber, stone, and natural materials. 
                7.2 The Contractor will make best efforts to match samples provided, but cannot guarantee exact matches due 
                to natural material variation.'''
            },
            {
                'heading': '8. MATERIAL OWNERSHIP',
                'content': '''8.1 Unless otherwise agreed: (a) only new materials or Client-approved reclaimed materials will be used; 
                (b) demolished materials become Contractor property; (c) surplus materials remain Contractor property.'''
            },
            {
                'heading': '9. PROVISIONAL ITEMS',
                'content': '''9.1 The Contractor is not responsible for appliance installation or service connections unless 
                specifically agreed. 9.2 Provisional items must be listed in Schedule 2 with estimated costs. 9.3 Actual costs 
                exceeding estimates will be added to the contract price plus the specified margin.'''
            },
            {
                'heading': '10. PROJECT DELAYS',
                'content': '''10.1 The Contractor will use reasonable efforts to achieve completion within the specified timeframe. 
                10.2 The Contractor is not liable for delays caused by factors beyond control, including Client-caused delays 
                such as: (a) delayed selections; (b) site unreadiness; (c) access denial. 10.3 Completion dates may be extended 
                with written notice. 10.4 Client-caused delays may incur additional costs plus 20% markup.'''
            },
            {
                'heading': '11. VARIATION PROCEDURES',
                'content': '''11.1 Variation requests require written documentation detailing scope, cost, timing, and potential delays. 
                11.2 Contractor-initiated variations must state justification. 11.3 Client acceptance via signed variation 
                document authorizes work commencement. 11.4 Variations without fixed pricing will be charged at actual cost plus 20%.'''
            },
            {
                'heading': '12. UNFORESEEN CONDITIONS',
                'content': '''12.1 Discovery of unforeseen circumstances requires immediate written Client notification. Work may be 
                suspended. 12.2 Additional work required due to unforeseen conditions constitutes a variation under Clause 11.'''
            },
            {
                'heading': '13. CLIENT-PROVIDED WORK',
                'content': '''13.1 Client-provided plumbing, electrical, or appliances must be ready 24 hours before installation 
                commencement. 13.2 All Client-provided services must be performed by appropriately licensed professionals.'''
            },
            {
                'heading': '14. SUBCONTRACTING',
                'content': '''14.1 The Contractor may engage subcontractors for any obligations. 14.2 The Client must not direct 
                subcontractors or on-site workers.'''
            },
            {
                'heading': '15. RISK ALLOCATION',
                'content': '''15.1 Products become Client risk upon site delivery. 15.2 Client-supplied materials and work remain 
                at Client risk.'''
            },
            {
                'heading': '16. INSURANCE REQUIREMENTS',
                'content': '''16.1 The Contractor maintains public liability insurance of minimum $10 million. 16.2 The Client should 
                maintain similar coverage. 16.3 Additional insurance requested by Client will be charged at actual cost plus 20%.'''
            },
            {
                'heading': '17. ENTIRE AGREEMENT',
                'content': '''17.1 This contract, including all terms, conditions, plans, and specifications, constitutes the complete 
                agreement between parties, superseding all prior discussions or agreements.'''
            },
            {
                'heading': '18. DOCUMENT PRECEDENCE',
                'content': '''18.1 In case of conflict, precedence is: (a) these conditions; (b) plans; (c) specifications.'''
            },
            {
                'heading': '19. LATE PAYMENT INTEREST',
                'content': '''19.1 Overdue payments accrue interest at the applicable Supreme Court post-judgment rate. Late payment 
                constitutes serious breach.'''
            },
            {
                'heading': '20. COLLECTION COSTS',
                'content': '''20.1 The Client must reimburse all debt collection costs and commissions incurred by the Contractor.'''
            },
            {
                'heading': '21. TITLE RETENTION',
                'content': '''21.1 Product ownership remains with Contractor until full payment, even after installation. 
                21.2 Upon payment default, the Contractor may enter the site to remove products and materials.'''
            },
            {
                'heading': '22. LAND CHARGE',
                'content': '''22.1 The site property is charged as security for payment obligations, enforceable upon court or tribunal order.'''
            },
            {
                'heading': '23. INTELLECTUAL PROPERTY',
                'content': '''23.1 The Contractor retains all copyright in plans, specifications, and workshop drawings. 
                23.2 Client-provided documents infringing third-party rights indemnify the Contractor against claims.'''
            },
            {
                'heading': '24. JOINT LIABILITY',
                'content': '''24.1 Multiple Clients have joint and several liability. Notice to one party binds all parties.'''
            },
            {
                'heading': '25. SUSPENSION RIGHTS',
                'content': '''25.1 Client breach permits work suspension. 25.2 Work resumes within reasonable time after written 
                notice of breach remedy.'''
            },
            {
                'heading': '26. NOTICE PROCEDURES',
                'content': '''26.1 Notices are effective when: (a) hand-delivered; (b) mailed to last known address (2 business days); 
                (c) emailed; (d) sent via electronic means with delivery confirmation.'''
            },
            {
                'heading': '27. CONTRACT TERMINATION',
                'content': '''27.1 Serious breach permits the non-breaching party to request remedy. 14-day failure to remedy permits 
                contract termination via written notice.'''
            },
            {
                'heading': '28. TERMINATION EFFECTS',
                'content': '''28.1 Upon termination, Client must pay actual costs for all work completed to termination date.'''
            },
            {
                'heading': '29. INSOLVENCY',
                'content': '''29.1 Insolvency of either party permits the other party to terminate via written notice. 
                29.2 Insolvency includes bankruptcy, liquidation, receivership, or deed of arrangement.'''
            },
            {
                'heading': '30. STATUTORY WARRANTIES',
                'content': '''30.1 As required by applicable building legislation, the Contractor warrants: (a) work performed with 
                due care and skill; (b) materials suitable and compliant; (c) compliance with building codes and regulations; 
                (d) timely completion; (e) fitness for intended purpose.'''
            },
            {
                'heading': '31. GST PROVISIONS',
                'content': '''31.1 GST applicable to additional charges will be added to calculated prices as per contract terms.'''
            },
            {
                'heading': '32. REGULATORY COMPLIANCE',
                'content': '''32.1 Work shall comply with: (a) Building Code of Australia; (b) relevant standards and specifications; 
                (c) development consent conditions. 32.2 Contractor not liable for non-compliance resulting from Client-specified 
                designs if written notice was provided. 32.3 Plans and specifications form part of this contract; variations require 
                written agreement.'''
            },
            {
                'heading': '33. DEFINITIONS',
                'content': '''Key terms: "Contract Price" means total price in Schedule 1. "Practical Completion" means work complete 
                except minor items not preventing reasonable use. "Site" means address in Schedule 1. "Variation" means any change 
                to work scope. "Working Days" excludes weekends and public holidays. "Works" means all contract work including variations.'''
            }
        ]


def calculate_payment_schedule(total_price):
    """
    Calculate standard Australian bathroom renovation payment schedule
    
    Args:
        total_price: Total contract price
    
    Returns:
        List of payment stages with amounts and percentages
    """
    schedule = [
        {
            'stage': '1',
            'description': 'Deposit (upon contract signing)',
            'percentage': 10,
            'amount': round(total_price * 0.10, 2)
        },
        {
            'stage': '2',
            'description': 'Demolition, Frame & Rough-in Complete',
            'percentage': 40,
            'amount': round(total_price * 0.40, 2)
        },
        {
            'stage': '3',
            'description': 'Coverings & Tiling Complete',
            'percentage': 30,
            'amount': round(total_price * 0.30, 2)
        },
        {
            'stage': '4',
            'description': 'Fit-off & Handover Complete',
            'percentage': 20,
            'amount': round(total_price * 0.20, 2)
        }
    ]
    
    # Adjust final payment for rounding
    total_scheduled = sum(s['amount'] for s in schedule)
    if total_scheduled != total_price:
        schedule[-1]['amount'] += (total_price - total_scheduled)
    
    return schedule
