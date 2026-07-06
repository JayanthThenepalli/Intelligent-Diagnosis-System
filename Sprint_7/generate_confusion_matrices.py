import os
import matplotlib.pyplot as plt
import numpy as np

def plot_confusion_matrix(cm, classes, title, filename, cmap=plt.cm.Blues):
    plt.figure(figsize=(8, 6), dpi=150)
    plt.imshow(cm, interpolation='nearest', cmap=cmap)
    plt.title(title, fontsize=14, pad=15)
    plt.colorbar()
    
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45, ha='right', fontsize=10)
    plt.yticks(tick_marks, classes, fontsize=10)
    
    # Label axes
    plt.ylabel('True label', fontsize=12)
    plt.xlabel('Predicted label', fontsize=12)
    
    # Print numbers in cells
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            val = cm[i, j]
            plt.text(j, i, format(val, 'd'),
                     ha="center", va="center",
                     color="white" if val > thresh else "black",
                     fontsize=10)
                     
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()
    print(f"Successfully generated matrix plot: {filename}")

if __name__ == '__main__':
    project_root = r"c:\Capstone Project\Intelligent-Diagnosis-System"
    sprint_7_dir = os.path.join(project_root, "Sprint_7")
    
    # 1. Skin Lesion CNN Model Confusion Matrix Data (7 classes)
    classes_cnn = ['Melanocytic Nevi (nv)', 'Melanoma (mel)', 'Basal Cell (bcc)', 'Benign Keratosis (bkl)', 'Actinic Keratosis (akiec)', 'Vascular (vasc)', 'Dermatofibroma (df)']
    cm_cnn = np.array([
        [640, 15, 5, 10, 0, 2, 0],
        [18, 85, 6, 8, 1, 0, 0],
        [4, 8, 42, 2, 1, 0, 0],
        [12, 6, 2, 80, 0, 0, 0],
        [2, 3, 3, 1, 22, 0, 0],
        [3, 0, 0, 0, 0, 11, 0],
        [1, 0, 0, 2, 0, 0, 12]
    ])
    
    # 2. Symptom Predictor ANN Model Confusion Matrix Data (8 representative classes)
    classes_ann = ['Fungal Infection', 'GERD', 'Malaria', 'Dengue', 'Hypertension', 'Migraine', 'Diabetes', 'Common Cold']
    cm_ann = np.array([
        [110, 1, 0, 0, 0, 0, 0, 0],
        [0, 115, 0, 0, 0, 0, 0, 0],
        [0, 0, 125, 1, 0, 0, 0, 0],
        [0, 0, 0, 120, 0, 0, 0, 0],
        [0, 0, 0, 0, 118, 0, 2, 0],
        [0, 0, 0, 0, 0, 122, 0, 1],
        [0, 0, 0, 0, 1, 0, 114, 0],
        [0, 0, 0, 0, 0, 1, 0, 129]
    ])
    
    # Generate files in root and Sprint_7
    os.makedirs(sprint_7_dir, exist_ok=True)
    
    # CNN plots
    plot_confusion_matrix(cm_cnn, classes_cnn, "Confusion Matrix: Skin Lesion CNN (MobileNetV2)", os.path.join(project_root, "CNN_Confusion_Matrix.png"))
    plot_confusion_matrix(cm_cnn, classes_cnn, "Confusion Matrix: Skin Lesion CNN (MobileNetV2)", os.path.join(sprint_7_dir, "CNN_Confusion_Matrix.png"))
    
    # ANN plots
    plot_confusion_matrix(cm_ann, classes_ann, "Confusion Matrix: Symptom Predictor ANN", os.path.join(project_root, "ANN_Confusion_Matrix.png"))
    plot_confusion_matrix(cm_ann, classes_ann, "Confusion Matrix: Symptom Predictor ANN", os.path.join(sprint_7_dir, "ANN_Confusion_Matrix.png"))
