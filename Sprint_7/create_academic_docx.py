import os
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

def build_academic_report():
    doc = Document()
    
    # Configure academic page margins (1 inch on all sides)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Style definitions
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Times New Roman'
    font.size = Pt(12)

    # ----------------------------------------------------
    # TITLE PAGE
    # ----------------------------------------------------
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title_p.add_run('\n\n\n\nUNIVERSITY OF EUROPE FOR APPLIED SCIENCES\n\n')
    title_run.font.size = Pt(14)
    title_run.bold = True
    
    title_run2 = title_p.add_run('MASTER OF SCIENCE IN SOFTWARE ENGINEERING\n\n\n\n')
    title_run2.font.size = Pt(12)
    title_run2.bold = True

    title_run3 = title_p.add_run('CAPSTONE PROJECT REPORT\n\n')
    title_run3.font.size = Pt(16)
    title_run3.bold = True
    
    title_run4 = title_p.add_run('MEDIWISE AI: AN INTELLIGENT CLINICAL DIAGNOSIS PORTAL FOR TRIAGE AND LESION CLASSIFICATION UNDER UNCERTAINTY\n\n\n\n\n\n')
    title_run4.font.size = Pt(14)
    title_run4.bold = True

    info_p = doc.add_paragraph()
    info_p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    info_p.add_run('Submitted By:\n').bold = True
    info_p.add_run('Last Name: Jayanth\nFirst Name: Thenepalle\nMatriculation No: 77287704\n\n').italic = True
    info_p.add_run('Academic Supervisor:\n').bold = True
    info_p.add_run('Faculty of Software Engineering\n\n').italic = True
    info_p.add_run('Date of Submission: July 6, 2026\nBerlin, Germany')

    doc.add_page_break()

    # ----------------------------------------------------
    # ABSTRACT
    # ----------------------------------------------------
    h = doc.add_heading('Abstract', level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    abstract_text = (
        "In modern healthcare systems, delayed or inaccessible preliminary diagnostic guidance represents a critical "
        "challenge, often leading to poor patient outcomes. This Capstone Project presents MediWise AI, a multi-tier, "
        "cloud-native web application designed to deliver secure, scalable, and interpretable clinical predictions under "
        "uncertainty. The system integrates a dynamic React.js frontend with an asynchronous FastAPI backend and a "
        "centralized MongoDB Atlas cloud database. The predictive core comprises two distinct machine learning models: "
        "a feedforward Artificial Neural Network (ANN) trained on 132 symptoms to classify 41 diseases with 98.42% accuracy, "
        "and a Convolutional Neural Network (CNN) employing MobileNetV2 transfer learning trained on 10,015 HAM10000 dermoscopy "
        "images to classify 7 lesion types with 89.5% accuracy. To guarantee security and centralized updates, models are "
        "deployed statelessly on a Python server. This report outlines the engineering methodologies, model validation metrics, "
        "and system integration pipelines implemented in this Capstone Project."
    )
    doc.add_paragraph(abstract_text)
    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # ----------------------------------------------------
    doc.add_heading('Chapter 1: Introduction', level=1)
    
    doc.add_heading('1.1 Context and Motivation', level=2)
    doc.add_paragraph(
        "Preliminary diagnostic guidance is crucial in preventing minor clinical symptoms from escalating into "
        "acute conditions. However, patient access to medical specialists is frequently bottlenecked by administrative "
        "delays. MediWise AI is developed to bridge this gap, providing clinical triage checker logic and lesion image "
        "classification algorithms to assist clinicians in routing patients dynamically."
    )
    
    doc.add_heading('1.2 Research Objectives', level=2)
    doc.add_paragraph("The primary software engineering and machine learning objectives of this capstone include:")
    doc.add_paragraph('Designing a stateless, horizontally scalable API architecture capable of processing parallel client requests.', style='List Bullet')
    doc.add_paragraph('Training a high-precision symptom classification model capable of mapping sparse, incomplete inputs to definitive conditions under uncertainty.', style='List Bullet')
    doc.add_paragraph('Developing a secure, containerized neural network inference server to protect intellectual property from reverse-engineering.', style='List Bullet')
    doc.add_paragraph('Integrating cloud database persistence to track logs in compliance with clinical audit standards.', style='List Bullet')
    
    # ----------------------------------------------------
    # CHAPTER 2: METHODOLOGY & MODEL DEVELOPMENT
    # ----------------------------------------------------
    doc.add_heading('Chapter 2: Methodology & Model Development', level=1)
    
    doc.add_heading('2.1 Symptom Predictor ANN', level=2)
    doc.add_paragraph(
        "The symptom checker utilizes a fully connected Artificial Neural Network (ANN) designed with Keras. "
        "The model ingests a 132-dimension binary feature space (representing the presence or absence of specific clinical symptoms) "
        "and outputs a probability array across 41 target illnesses. Standard z-score scaling was omitted due to the binary "
        "nature of the input space. Overfitting is prevented using Dropout layers (rate = 0.2) and early stopping criteria during training."
    )

    doc.add_heading('2.2 Image Classifier CNN', level=2)
    doc.add_paragraph(
        "For skin lesion classification, we implement a Convolutional Neural Network (CNN) using MobileNetV2 as a base feature "
        "extractor. Transfer learning was leveraged by loading weights pre-trained on ImageNet. The top layers were replaced "
        "with a Global Average Pooling layer, a fully connected layer (128 units, ReLU activation, 50% Dropout), and a final "
        "Softmax layer outputting probabilities for 7 key clinical classes from the HAM10000 dataset."
    )

    doc.add_heading('2.3 Clinical Workflow Data Pipeline', level=2)
    doc.add_paragraph(
        "The system processes user parameters through a strict validation and execution pipeline as diagrammed below:"
    )
    
    # Insert Workflow Diagram
    workflow_img_path = "Clinical_Workflow.png"
    if os.path.exists(workflow_img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.add_run().add_picture(workflow_img_path, width=Inches(5.0))
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.add_run("Figure 2.1: Clinical Workflow Data Flowchart").italic = True

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 3: SYSTEM ARCHITECTURE
    # ----------------------------------------------------
    doc.add_heading('Chapter 3: System Architecture', level=1)
    
    doc.add_heading('3.1 Three-Tier Decoupled Infrastructure', level=2)
    doc.add_paragraph(
        "MediWise AI utilizes a decoupled web application architecture consisting of three discrete tiers:"
    )
    doc.add_paragraph('Presentation Layer: A React.js SPA built with Vite and compiled under Node.js, hosted on Vercel.', style='List Bullet')
    doc.add_paragraph('Logic/Service Layer: A stateless FastAPI API built in Python, hosted on Render.com, handling model load and inference.', style='List Bullet')
    doc.add_paragraph('Persistence Layer: A cloud-based MongoDB Atlas cluster storing diagnostic logging entries.', style='List Bullet')

    # Insert Architecture Diagram
    arch_img_path = "System_Architecture.png"
    if os.path.exists(arch_img_path):
        p_img2 = doc.add_paragraph()
        p_img2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img2.add_run().add_picture(arch_img_path, width=Inches(5.0))
        p_cap2 = doc.add_paragraph()
        p_cap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap2.add_run("Figure 3.1: Decoupled Multi-Tier System Architecture").italic = True

    doc.add_heading('3.2 Data Flow Logic', level=2)
    doc.add_paragraph(
        "Client requests dispatch JSON payloads or multipart FormData to the server. The FastAPI service executes inference "
        "in-memory (caching the models on startup to reduce response latency to <100ms) and dispatches the raw diagnostic log "
        "to MongoDB Atlas asynchronously using the non-blocking 'motor' driver. This ensures the database transaction does not "
        "block the primary HTTP response pipeline, satisfying high availability constraints."
    )

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 4: TESTING, EVALUATION & METRICS
    # ----------------------------------------------------
    doc.add_heading('Chapter 4: Testing, Evaluation & Metrics', level=1)
    
    doc.add_heading('4.1 Model Evaluation Matrix', level=2)
    doc.add_paragraph(
        "The following matrix summarizes the comparative performance metrics across all baseline and final deployed models:"
    )
    
    # Insert Master Comparison Table
    table_matrix = doc.add_table(rows=5, cols=7)
    table_matrix.style = 'Light Shading Accent 1'
    hdr = table_matrix.rows[0].cells
    hdr[0].text = 'Model Architecture'
    hdr[1].text = 'Diagnosis Target'
    hdr[2].text = 'Parameters / Epochs'
    hdr[3].text = 'Accuracy'
    hdr[4].text = 'Precision'
    hdr[5].text = 'Recall'
    hdr[6].text = 'F1-Score'
    
    matrix_rows = [
        ['Decision Tree (Baseline)', 'Symptoms', 'Max Depth = 15', '92.30%', '92.45%', '92.30%', '92.31%'],
        ['Random Forest (Baseline)', 'Symptoms', '100 Trees', '96.50%', '96.60%', '96.50%', '96.52%'],
        ['Artificial Neural Network', 'Symptoms', '50 Epochs', '98.42%', '98.44%', '98.42%', '98.42%'],
        ['MobileNetV2 CNN', 'Lesion Scans', '5 Epochs (ImageNet)', '89.50%', '88.90%', '89.50%', '88.70%']
    ]
    
    for row_idx, data in enumerate(matrix_rows):
        row_cells = table_matrix.rows[row_idx + 1].cells
        for col_idx, text in enumerate(data):
            row_cells[col_idx].text = text

    # Baseline 1: Decision Tree
    doc.add_heading('4.2 Baseline Decision Tree Performance', level=2)
    doc.add_paragraph(
        "The baseline Decision Tree Classifier achieved an accuracy of 92.30%. The confusion matrix highlights "
        "noticeable misclassification errors, especially confusing Dengue with Malaria and Hypertension with GERD."
    )
    dt_img = "Decision_Tree_Confusion_Matrix.png"
    if os.path.exists(dt_img):
        p_dt = doc.add_paragraph()
        p_dt.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_dt.add_run().add_picture(dt_img, width=Inches(4.5))
        p_dt_cap = doc.add_paragraph()
        p_dt_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_dt_cap.add_run("Figure 4.1: Decision Tree Confusion Matrix Heatmap").italic = True

    # Baseline 2: Random Forest
    doc.add_heading('4.3 Baseline Random Forest Performance', level=2)
    doc.add_paragraph(
        "The Random Forest Classifier improved baseline accuracy to 96.50% by building 100 bootstrap-aggregated decision trees, "
        "stabilizing predictions and minimizing outlier symptom errors."
    )
    rf_img = "Random_Forest_Confusion_Matrix.png"
    if os.path.exists(rf_img):
        p_rf = doc.add_paragraph()
        p_rf.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_rf.add_run().add_picture(rf_img, width=Inches(4.5))
        p_rf_cap = doc.add_paragraph()
        p_rf_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_rf_cap.add_run("Figure 4.2: Random Forest Confusion Matrix Heatmap").italic = True

    doc.add_page_break()

    # Final Deployed Models
    doc.add_heading('4.4 Symptom Predictor ANN Performance', level=2)
    doc.add_paragraph(
        "The final deployed Keras ANN model achieved 98.42% accuracy. The confusion matrix below shows extremely high diagonal "
        "sensitivity and near-zero off-diagonal errors."
    )
    ann_img = "ANN_Confusion_Matrix.png"
    if os.path.exists(ann_img):
        p_ann = doc.add_paragraph()
        p_ann.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ann.add_run().add_picture(ann_img, width=Inches(4.5))
        p_ann_cap = doc.add_paragraph()
        p_ann_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ann_cap.add_run("Figure 4.3: Symptom Predictor ANN Confusion Matrix Heatmap").italic = True

    doc.add_heading('4.5 Skin Lesion CNN Performance', level=2)
    doc.add_paragraph(
        "The skin cancer CNN classifier achieved 89.50% overall validation accuracy. The confusion matrix shows high performance "
        "identifying critical conditions like Melanoma (85/118 correct) and Basal Cell Carcinoma (42/57 correct)."
    )
    cnn_img = "CNN_Confusion_Matrix.png"
    if os.path.exists(cnn_img):
        p_cnn = doc.add_paragraph()
        p_cnn.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cnn.add_run().add_picture(cnn_img, width=Inches(4.5))
        p_cnn_cap = doc.add_paragraph()
        p_cnn_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cnn_cap.add_run("Figure 4.4: Skin Lesion CNN (MobileNetV2) Confusion Matrix Heatmap").italic = True

    # ----------------------------------------------------
    # CHAPTER 5: SOFTWARE ENGINEERING INNOVATIONS
    # ----------------------------------------------------
    doc.add_heading('Chapter 5: Software Engineering Innovations', level=1)
    
    doc.add_heading('5.1 Automated Clinical Specialist Referral', level=2)
    doc.add_paragraph(
        "To translate machine learning metrics into actionable patient outcomes, we implemented a clinical specialty routing map. "
        "The client parses classification results and suggests consulting specific specialists. For example, conditions like "
        "Melanoma or Basal Cell Carcinoma refer patients to a Dermatologist, while Hypertension refers them to a Cardiologist."
    )

    doc.add_heading('5.2 Print-Media Referrals Exporter', level=2)
    doc.add_paragraph(
        "We incorporated custom CSS print rules to enable document exportation. Clicking the Print button triggers browser-native "
        "printing, hiding the diagnostic controls and navigation panes while converting the results panel into a formatted clinical "
        "referral letter suitable for physical print or PDF download."
    )

    # ----------------------------------------------------
    # CHAPTER 6: CONCLUSION
    # ----------------------------------------------------
    doc.add_heading('Chapter 6: Conclusion', level=1)
    doc.add_paragraph(
        "The MediWise AI Capstone Project successfully fulfills all software engineering and data science milestones. "
        "We successfully designed, trained, integrated, and deployed a secure, stateless diagnostic portal. The application is "
        "publicly accessible on the web, demonstrating that neural network algorithms can be served asynchronously and secure "
        "in production medical triage systems."
    )

    output_file = 'Academic_Final_Report.docx'
    doc.save(output_file)
    print(f"Updated Academic Report saved successfully as {output_file}!")

if __name__ == '__main__':
    build_academic_report()
