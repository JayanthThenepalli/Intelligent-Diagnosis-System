import json
import urllib.request
import os

architecture_dot = """
digraph Architecture {
    rankdir=TB;
    fontname="Helvetica";
    node [shape=box, style="rounded,filled", fillcolor="#f8fafc", color="#cbd5e1", penwidth=1.5, fontname="Helvetica", fontsize=10];
    edge [color="#64748b", penwidth=2, fontname="Helvetica", fontsize=9];

    subgraph cluster_client {
        label="Presentation Layer (Vercel Edge Network)";
        fontname="Helvetica-Bold"; fontsize=11; color="#6366f1"; fillcolor="#e0e7ff"; style="filled,dashed";
        ReactSPA [label="React.js Single Page App\\n(Vite Build, Static Assets)", fillcolor="#ffffff", shape=box, penwidth=2];
        BrowserUI [label="Clinician Dashboard UI\\n(Triage & Scanner Consoles)", fillcolor="#ffffff", shape=rect];
        ReactSPA -> BrowserUI [dir=both, style=dotted];
    }

    subgraph cluster_backend {
        label="Service Layer (Render Cloud Services)";
        fontname="Helvetica-Bold"; fontsize=11; color="#0ea5e9"; fillcolor="#e0f2fe"; style="filled,dashed";
        FastAPI [label="FastAPI Python API\\n(Stateless Server, Uvicorn)", fillcolor="#ffffff", shape=box, penwidth=2];
        
        subgraph cluster_models {
            label="Keras Inference Engines";
            fontname="Helvetica-Bold"; fontsize=10; color="#d946ef"; fillcolor="#fae8ff"; style="filled,dotted";
            ANN [label="Symptom ANN Model\\n(Weights in RAM)", fillcolor="#ffffff"];
            CNN [label="Skin Lesion MobileNetV2 CNN\\n(Weights in RAM)", fillcolor="#ffffff"];
        }
        
        FastAPI -> ANN;
        FastAPI -> CNN;
    }

    subgraph cluster_data {
        label="Data Layer (MongoDB Cloud Atlas)";
        fontname="Helvetica-Bold"; fontsize=11; color="#10b981"; fillcolor="#dcfce7"; style="filled,dashed";
        MongoAtlas [label="MongoDB Atlas Replica Set\\n(mediwise_db)", fillcolor="#ffffff", shape=cylinder, penwidth=2];
    }

    # Inter-layer connections
    BrowserUI -> FastAPI [label="HTTPS POST (JSON / Multipart Data)", color="#6366f1", penwidth=2.5];
    FastAPI -> BrowserUI [label="HTTPS 200 (Probabilities & Referrals)", color="#0ea5e9", penwidth=2];
    
    FastAPI -> MongoAtlas [label="Asynchronous Insertion\\n(motor async driver)", color="#10b981", penwidth=2];
}
"""

workflow_dot = """
digraph Workflow {
    rankdir=TB;
    fontname="Helvetica";
    node [shape=box, style="rounded,filled", fillcolor="#f8fafc", color="#cbd5e1", penwidth=1.5, fontname="Helvetica", fontsize=10];
    edge [color="#64748b", penwidth=1.5, fontname="Helvetica", fontsize=9];

    Start [label="Clinician Logs In", shape=ellipse, fillcolor="#3b82f6", fontcolor=white];
    SelectType [label="Select Diagnostic Modality", shape=diamond, fillcolor="#fef08a"];
    
    # Path 1: Symptoms
    SymInput [label="Input patient symptoms\\n(e.g., skin_rash, nose_bleeding)"];
    SymValid [label="Client validation\\n(Blank check)", shape=diamond, fillcolor="#fef08a"];
    SymPack [label="Encode into 132-dim\\nbinary vector"];
    
    Start -> SelectType;
    SelectType -> SymInput [label="Symptom Predictor"];
    SymInput -> SymValid;
    SymValid -> SymPack [label="Valid"];
    SymValid -> SymInput [label="Empty (Show alert)", color="#ef4444"];

    # Path 2: Images
    ImgInput [label="Upload lesion image\\n(Clinical / Dermoscopy)"];
    ImgValid [label="Client validation\\n(Type: image, Size: <10MB)", shape=diamond, fillcolor="#fef08a"];
    ImgPack [label="Package image file\\ninto Form Data"];
    
    SelectType -> ImgInput [label="Image Scanner"];
    ImgInput -> ImgValid;
    ImgValid -> ImgPack [label="Valid"];
    ImgValid -> ImgInput [label="Invalid (Show alert)", color="#ef4444"];

    # Backend
    APIRequest [label="HTTPS Request\\n(Post to Render API)", fillcolor="#c084fc"];
    SymPack -> APIRequest;
    ImgPack -> APIRequest;
    
    RunInference [label="Run Model Inference\\n(Softmax probabilities)", fillcolor="#fda4af"];
    APIRequest -> RunInference;
    
    LogDB [label="Persist entry to\\nMongoDB Atlas", shape=cylinder, fillcolor="#86efac"];
    ReturnRes [label="Return JSON predictions\\n& routing metadata", fillcolor="#93c5fd"];
    
    RunInference -> LogDB;
    RunInference -> ReturnRes;
    
    RenderUI [label="React renders radial\\nconfidence & routing specialist", fillcolor="#ffffff", penwidth=2];
    ReturnRes -> RenderUI;
    
    ExportReport [label="Export clinical referral\\nreport (Print to PDF)", shape=rect, fillcolor="#e2e8f0"];
    RenderUI -> ExportReport [style=dashed];
}
"""

def generate_image(dot_src, filename):
    url = "https://quickchart.io/graphviz"
    payload = json.dumps({"graph": dot_src}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            with open(filename, "wb") as f:
                f.write(response.read())
            print(f"Successfully generated {filename}!")
    except Exception as e:
        print(f"Failed to generate {filename}: {e}")

if __name__ == '__main__':
    # Make sure output directories exist
    os.makedirs('Sprint_7', exist_ok=True)
    
    # Generate images locally
    generate_image(architecture_dot, "System_Architecture.png")
    generate_image(workflow_dot, "Clinical_Workflow.png")
    
    # Copy images to Sprint_7 folder
    import shutil
    shutil.copy("System_Architecture.png", "Sprint_7/System_Architecture.png")
    shutil.copy("Clinical_Workflow.png", "Sprint_7/Clinical_Workflow.png")
