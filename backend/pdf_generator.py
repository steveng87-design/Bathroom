from reportlab.lib.pagesizes import A4, letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
import os
from typing import Dict, List, Any
import io
import base64

class BathroomProposalPDF:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom styles matching the professional template"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Normal'],
            fontSize=16,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            spaceBefore=20,
            fontName='Helvetica-Bold',
            backColor=colors.HexColor('#eff6ff'),
            borderPadding=8
        ))
        
        # Professional body text
        self.styles.add(ParagraphStyle(
            name='ProfessionalBody',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#374151'),
            spaceAfter=8,
            alignment=TA_JUSTIFY,
            fontName='Helvetica'
        ))
        
        # Task list style
        self.styles.add(ParagraphStyle(
            name='TaskList',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#4b5563'),
            spaceAfter=4,
            leftIndent=20,
            fontName='Helvetica'
        ))

    def create_proposal(self, quote_data: Dict[str, Any], user_profile: Dict[str, Any]) -> bytes:
        """Generate a complete professional proposal PDF"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=25*mm,
            leftMargin=25*mm,
            topMargin=25*mm,
            bottomMargin=25*mm
        )
        
        story = []
        
        # Cover Page
        story.extend(self._create_cover_page(quote_data, user_profile))
        story.append(PageBreak())
        
        # Company Overview
        story.extend(self._create_company_overview(user_profile))
        story.append(PageBreak())
        
        # Project Summary
        story.extend(self._create_project_summary(quote_data))
        
        # Detailed Scope of Works
        story.extend(self._create_scope_of_works(quote_data))
        story.append(PageBreak())
        
        # Terms and Conditions
        story.extend(self._create_terms_conditions())
        
        # Contact Information
        story.extend(self._create_contact_info(user_profile))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
    def _create_cover_page(self, quote_data: Dict[str, Any], user_profile: Dict[str, Any]) -> List:
        """Create professional cover page"""
        elements = []
        
        # Company branding
        elements.append(Paragraph(
            f"<b>{user_profile.get('company_name', 'Bathroom Quote Saver.AI')}</b>",
            self.styles['CustomTitle']
        ))
        elements.append(Spacer(1, 10*mm))
        
        # Project title
        elements.append(Paragraph(
            "PROFESSIONAL BATHROOM RENOVATION PROPOSAL",
            self.styles['CustomSubtitle']
        ))
        elements.append(Spacer(1, 15*mm))
        
        # Client details table
        client_data = [
            ['Client Name:', quote_data['client_info']['name']],
            ['Project Address:', quote_data['client_info']['address']],
            ['Contact:', quote_data['client_info']['email']],
            ['Phone:', quote_data['client_info']['phone']],
            ['Proposal Date:', datetime.now().strftime('%B %d, %Y')],
            ['Project ID:', quote_data.get('id', 'BQS-' + str(datetime.now().year) + '-001')]
        ]
        
        client_table = Table(client_data, colWidths=[60*mm, 100*mm])
        client_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#eff6ff')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1e40af')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db'))
        ]))
        
        elements.append(client_table)
        elements.append(Spacer(1, 20*mm))
        
        # Project overview
        room_measurements = quote_data['room_measurements']
        floor_area = room_measurements['length'] * room_measurements['width']
        wall_area = (2 * room_measurements['length'] * room_measurements['height']) + \
                   (2 * room_measurements['width'] * room_measurements['height'])
        
        overview_text = f"""
        <b>PROJECT OVERVIEW</b><br/><br/>
        We are pleased to present this comprehensive proposal for your bathroom renovation project. 
        This proposal outlines our professional approach to transforming your {floor_area:.1f}m² bathroom 
        with meticulous attention to detail and quality craftsmanship.<br/><br/>
        
        <b>Room Specifications:</b><br/>
        • Floor Area: {floor_area:.1f} square meters<br/>
        • Wall Area: {wall_area:.1f} square meters<br/>
        • Room Dimensions: {room_measurements['length']}m × {room_measurements['width']}m × {room_measurements['height']}m<br/><br/>
        
        <b>Estimated Investment:</b> <font color="#059669" size="14"><b>${quote_data['total_cost']:,.2f}</b></font>
        """
        
        elements.append(Paragraph(overview_text, self.styles['ProfessionalBody']))
        
        return elements
    
    def _create_company_overview(self, user_profile: Dict[str, Any]) -> List:
        """Create company overview section"""
        elements = []
        
        elements.append(Paragraph("ABOUT OUR COMPANY", self.styles['SectionHeader']))
        
        company_text = f"""
        <b>{user_profile.get('company_name', 'Professional Bathroom Renovations')}</b> brings years of experience 
        in delivering exceptional bathroom renovation projects. Our commitment to quality, precision, and client 
        satisfaction has established us as a trusted partner in residential renovations.<br/><br/>
        
        <b>Our Core Values:</b><br/>
        • Precision and accuracy in all work phases<br/>
        • Clear communication throughout the project<br/>
        • Meeting agreed deadlines and schedules<br/>
        • Minimizing disruption to your daily routine<br/>
        • Transparent pricing with no hidden costs<br/>
        • Quality materials and professional craftsmanship<br/><br/>
        
        <b>Professional Credentials:</b><br/>
        • Licensed Building Contractor: {user_profile.get('license_number', 'XXXX-XXXX')}<br/>
        • Fully Insured and Bonded<br/>
        • Certificate IV in Building and Construction<br/>
        • Over {user_profile.get('years_experience', '5')} years of specialized experience<br/>
        • {user_profile.get('projects_completed', '100+')} successful projects completed<br/><br/>
        
        We utilize advanced project management techniques and the latest tools, including our proprietary 
        <b>Bathroom Quote Saver.AI</b> system, to ensure accurate pricing and efficient project execution.
        """
        
        elements.append(Paragraph(company_text, self.styles['ProfessionalBody']))
        
        return elements
    
    def _create_project_summary(self, quote_data: Dict[str, Any]) -> List:
        """Create project summary section"""
        elements = []
        
        elements.append(Paragraph("PROJECT SUMMARY", self.styles['SectionHeader']))
        
        # Selected components
        selected_components = []
        detailed_components = quote_data.get('detailed_components') or {}
        for component, details in detailed_components.items():
            if details and details.get('enabled'):
                component_name = component.replace('_', ' ').title()
                selected_components.append(component_name)
                
                # Add selected subtasks
                subtasks = []
                subtasks_dict = details.get('subtasks') or {}
                for subtask_key, selected in subtasks_dict.items():
                    if selected:
                        subtask_name = subtask_key.replace('_', ' ').title()
                        subtasks.append(f"  → {subtask_name}")
                
                if subtasks:
                    selected_components.extend(subtasks)
        
        if selected_components:
            components_text = "<b>Selected Project Components:</b><br/>"
            for component in selected_components:
                if component.startswith('  →'):
                    components_text += f"{component}<br/>"
                else:
                    components_text += f"<br/><b>• {component}</b><br/>"
            
            elements.append(Paragraph(components_text, self.styles['ProfessionalBody']))
        
        return elements
    
    def _create_scope_of_works(self, quote_data: Dict[str, Any]) -> List:
        """Create detailed scope of works section"""
        elements = []
        
        elements.append(Paragraph("DETAILED SCOPE OF WORKS", self.styles['SectionHeader']))
        
        # Stage 1: Demolition & Preparation
        elements.append(Paragraph("<b>STAGE 1: DEMOLITION & PREPARATION</b>", 
                                self.styles['Heading2']))
        
        stage1_tasks = [
            "Site protection and preparation",
            "Removal of existing fixtures and fittings",
            "Demolition of wall and ceiling linings (as selected)",
            "Removal of floor tiles and substrate (as selected)",
            "Plumbing rough-in modifications",
            "Electrical rough-in work",
            "Waste disposal and site cleanup"
        ]
        
        for task in stage1_tasks:
            elements.append(Paragraph(f"• {task}", self.styles['TaskList']))
        
        elements.append(Spacer(1, 10*mm))
        
        # Stage 2: Construction & Installation
        elements.append(Paragraph("<b>STAGE 2: CONSTRUCTION & INSTALLATION</b>", 
                                self.styles['Heading2']))
        
        stage2_tasks = [
            "Framing and structural modifications",
            "New wall and ceiling sheet installation",
            "Plasterboard fixing and finishing",
            "Waterproofing membrane application",
            "Tile bed preparation and installation",
            "Wall and floor tiling (as per specifications)",
            "Grout and silicone application"
        ]
        
        for task in stage2_tasks:
            elements.append(Paragraph(f"• {task}", self.styles['TaskList']))
        
        elements.append(Spacer(1, 10*mm))
        
        # Stage 3: Completion & Handover
        elements.append(Paragraph("<b>STAGE 3: COMPLETION & HANDOVER</b>", 
                                self.styles['Heading2']))
        
        stage3_tasks = [
            "Fixture and fitting installation",
            "Electrical and plumbing connections",
            "Painting and final finishes",
            "Accessory installation",
            "Professional cleaning",
            "Quality inspection and testing",
            "Project handover and documentation"
        ]
        
        for task in stage3_tasks:
            elements.append(Paragraph(f"• {task}", self.styles['TaskList']))
        
        # Cost breakdown table
        elements.append(Spacer(1, 15*mm))
        elements.append(Paragraph("<b>INVESTMENT BREAKDOWN</b>", self.styles['Heading2']))
        
        if quote_data.get('cost_breakdown'):
            cost_data = [['Component', 'Description', 'Investment']]
            
            for item in quote_data['cost_breakdown']:
                cost_data.append([
                    item['component'],
                    item['notes'][:60] + '...' if len(item['notes']) > 60 else item['notes'],
                    f"${item['estimated_cost']:,.2f}"
                ])
            
            # Add total row
            cost_data.append(['', '<b>TOTAL PROJECT INVESTMENT</b>', f"<b>${quote_data['total_cost']:,.2f}</b>"])
            
            cost_table = Table(cost_data, colWidths=[40*mm, 90*mm, 30*mm])
            cost_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#eff6ff')),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
                ('ALIGN', (2, 0), (2, -1), 'RIGHT')
            ]))
            
            elements.append(cost_table)
        
        return elements
    
    def _create_terms_conditions(self) -> List:
        """Create terms and conditions section"""
        elements = []
        
        elements.append(Paragraph("TERMS & CONDITIONS", self.styles['SectionHeader']))
        
        terms_text = """
        <b>Payment Terms:</b><br/>
        • 10% deposit upon acceptance of proposal<br/>
        • 40% progress payment at completion of Stage 1<br/>
        • 40% progress payment at completion of Stage 2<br/>
        • 10% final payment upon project completion<br/><br/>
        
        <b>Project Timeline:</b><br/>
        • Estimated completion: 2-3 weeks from commencement<br/>
        • Weather and unforeseen circumstances may affect timeline<br/>
        • Client will be notified of any delays immediately<br/><br/>
        
        <b>Warranty & Guarantee:</b><br/>
        • 12 months warranty on all workmanship<br/>
        • Manufacturer warranty applies to all supplied products<br/>
        • 7-year structural warranty where applicable<br/><br/>
        
        <b>Variations & Changes:</b><br/>
        • All variations must be agreed in writing<br/>
        • Additional costs will be quoted separately<br/>
        • Client approval required before proceeding with variations<br/><br/>
        
        <b>Important Notes:</b><br/>
        • This proposal is valid for 30 days from issue date<br/>
        • All work complies with current building codes and regulations<br/>
        • Permits and approvals are the responsibility of the client<br/>
        • Access to water and electricity required during construction
        """
        
        elements.append(Paragraph(terms_text, self.styles['ProfessionalBody']))
        
        return elements
    
    def _create_contact_info(self, user_profile: Dict[str, Any]) -> List:
        """Create contact information section"""
        elements = []
        
        elements.append(Paragraph("CONTACT INFORMATION", self.styles['SectionHeader']))
        
        contact_text = f"""
        <b>Project Manager:</b> {user_profile.get('contact_name', 'Professional Team')}<br/>
        <b>Phone:</b> {user_profile.get('phone', 'Contact for details')}<br/>
        <b>Email:</b> {user_profile.get('email', 'info@bathroomquotesaver.ai')}<br/>
        <b>License Number:</b> {user_profile.get('license_number', 'XXXX-XXXX')}<br/><br/>
        
        <b>Business Hours:</b><br/>
        Monday - Friday: 7:00 AM - 6:00 PM<br/>
        Saturday: 8:00 AM - 4:00 PM<br/>
        Sunday: Emergency calls only<br/><br/>
        
        We look forward to working with you on this exciting project. Please don't hesitate to contact 
        us with any questions or to discuss any aspects of this proposal.<br/><br/>
        
        <b>Thank you for considering our services for your bathroom renovation project.</b>
        """
        
        elements.append(Paragraph(contact_text, self.styles['ProfessionalBody']))
        
        # Add signature line
        elements.append(Spacer(1, 20*mm))
        elements.append(Paragraph(
            "Proposal prepared by: _____________________________ Date: _____________", 
            self.styles['ProfessionalBody']
        ))
        
        return elements