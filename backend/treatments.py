
LABEL_INFO = {
    "Apple Scab": ("Apple", "Scab", False),
    "Apple with Black Rot": ("Apple", "Black Rot", False),
    "Cedar Apple Rust": ("Apple", "Cedar Apple Rust", False),
    "Healthy Apple": ("Apple", "Healthy", True),
    "Healthy Blueberry Plant": ("Blueberry", "Healthy", True),
    "Cherry with Powdery Mildew": ("Cherry", "Powdery Mildew", False),
    "Healthy Cherry Plant": ("Cherry", "Healthy", True),
    "Corn (Maize) with Cercospora and Gray Leaf Spot": ("Corn (Maize)", "Cercospora / Gray Leaf Spot", False),
    "Corn (Maize) with Common Rust": ("Corn (Maize)", "Common Rust", False),
    "Corn (Maize) with Northern Leaf Blight": ("Corn (Maize)", "Northern Leaf Blight", False),
    "Healthy Corn (Maize) Plant": ("Corn (Maize)", "Healthy", True),
    "Grape with Black Rot": ("Grape", "Black Rot", False),
    "Grape with Esca (Black Measles)": ("Grape", "Esca (Black Measles)", False),
    "Grape with Isariopsis Leaf Spot": ("Grape", "Isariopsis Leaf Spot", False),
    "Healthy Grape Plant": ("Grape", "Healthy", True),
    "Orange with Citrus Greening": ("Orange", "Citrus Greening (Huanglongbing)", False),
    "Peach with Bacterial Spot": ("Peach", "Bacterial Spot", False),
    "Healthy Peach Plant": ("Peach", "Healthy", True),
    "Bell Pepper with Bacterial Spot": ("Bell Pepper", "Bacterial Spot", False),
    "Healthy Bell Pepper Plant": ("Bell Pepper", "Healthy", True),
    "Potato with Early Blight": ("Potato", "Early Blight", False),
    "Potato with Late Blight": ("Potato", "Late Blight", False),
    "Healthy Potato Plant": ("Potato", "Healthy", True),
    "Healthy Raspberry Plant": ("Raspberry", "Healthy", True),
    "Healthy Soybean Plant": ("Soybean", "Healthy", True),
    "Squash with Powdery Mildew": ("Squash", "Powdery Mildew", False),
    "Strawberry with Leaf Scorch": ("Strawberry", "Leaf Scorch", False),
    "Healthy Strawberry Plant": ("Strawberry", "Healthy", True),
    "Tomato with Bacterial Spot": ("Tomato", "Bacterial Spot", False),
    "Tomato with Early Blight": ("Tomato", "Early Blight", False),
    "Tomato with Late Blight": ("Tomato", "Late Blight", False),
    "Tomato with Leaf Mold": ("Tomato", "Leaf Mold", False),
    "Tomato with Septoria Leaf Spot": ("Tomato", "Septoria Leaf Spot", False),
    "Tomato with Spider Mites or Two-spotted Spider Mite": ("Tomato", "Spider Mites (Two-spotted)", False),
    "Tomato with Target Spot": ("Tomato", "Target Spot", False),
    "Tomato Yellow Leaf Curl Virus": ("Tomato", "Yellow Leaf Curl Virus", False),
    "Tomato Mosaic Virus": ("Tomato", "Mosaic Virus", False),
    "Healthy Tomato Plant": ("Tomato", "Healthy", True),
}

TREATMENTS = {
    "Apple Scab": {
        "organic": "Remove and destroy fallen leaves each autumn to cut the fungus's overwintering site; apply sulfur or copper-based fungicide sprays from bud break through early summer.",
        "chemical": "Apply a myclobutanil or captan fungicide on a 7–10 day schedule starting at green tip through petal fall.",
    },
    "Apple with Black Rot": {
        "organic": "Prune out dead or cankered wood and mummified fruit; compost or burn debris away from the orchard.",
        "chemical": "Use a thiophanate-methyl or captan fungicide program timed to bloom and early fruit set.",
    },
    "Cedar Apple Rust": {
        "organic": "Remove nearby eastern red cedar/juniper hosts where feasible, or prune out gall growths before spring rains.",
        "chemical": "Apply myclobutanil starting at pink bud stage and continue through several weeks after petal fall.",
    },
    "Healthy Apple": {
        "organic": "No treatment needed — maintain good airflow through pruning and monitor regularly.",
        "chemical": "No treatment needed — continue a standard preventive spray schedule if disease pressure is historically high in your area.",
    },
    "Healthy Blueberry Plant": {
        "organic": "No treatment needed — mulch with pine bark and keep soil acidic (pH 4.5–5.5).",
        "chemical": "No treatment needed — routine fertilization program is sufficient.",
    },
    "Cherry with Powdery Mildew": {
        "organic": "Improve air circulation via pruning and apply sulfur or potassium bicarbonate sprays at first sign of white powdery growth.",
        "chemical": "Apply a myclobutanil or trifloxystrobin fungicide at 10–14 day intervals during active growth.",
    },
    "Healthy Cherry Plant": {
        "organic": "No treatment needed — maintain routine pruning for airflow.",
        "chemical": "No treatment needed — preventive fungicide only if mildew has been an issue historically.",
    },
    "Corn (Maize) with Cercospora and Gray Leaf Spot": {
        "organic": "Rotate crops away from corn for at least one season and use resistant hybrids where possible; till under residue to reduce spore survival.",
        "chemical": "Apply a strobilurin or triazole fungicide (e.g., azoxystrobin, propiconazole) at early disease onset, especially in continuous corn fields.",
    },
    "Corn (Maize) with Common Rust": {
        "organic": "Plant rust-resistant hybrids; rust rarely needs intervention beyond monitoring in most seasons.",
        "chemical": "Apply a triazole or strobilurin fungicide if pustules cover more than a few percent of leaf area before tasseling.",
    },
    "Corn (Maize) with Northern Leaf Blight": {
        "organic": "Rotate crops, till residue, and choose resistant hybrids; scout fields weekly during humid periods.",
        "chemical": "Apply a foliar fungicide (strobilurin + triazole premix) around tasseling if lesions are present on the ear leaf or above.",
    },
    "Healthy Corn (Maize) Plant": {
        "organic": "No treatment needed — rotate crops as a preventive measure.",
        "chemical": "No treatment needed — standard fertility program is sufficient.",
    },
    "Grape with Black Rot": {
        "organic": "Remove mummified berries and infected canes during dormant pruning; apply copper or sulfur sprays from bud break onward.",
        "chemical": "Apply a myclobutanil or mancozeb fungicide program starting at 2–3 inch shoot growth through veraison.",
    },
    "Grape with Esca (Black Measles)": {
        "organic": "Prune out and destroy infected wood in dry weather; avoid large pruning wounds and seal cuts.",
        "chemical": "No highly effective curative chemical treatment exists; focus on trunk protection with fungicidal pruning-wound sealants.",
    },
    "Grape with Isariopsis Leaf Spot": {
        "organic": "Improve canopy airflow through leaf pulling and remove infected leaf litter after harvest.",
        "chemical": "Apply a mancozeb or copper-based fungicide at 10–14 day intervals during wet periods.",
    },
    "Healthy Grape Plant": {
        "organic": "No treatment needed — maintain canopy management for airflow.",
        "chemical": "No treatment needed — continue routine preventive spray program.",
    },
    "Orange with Citrus Greening": {
        "organic": "Remove and destroy infected trees promptly to reduce spread; control the Asian citrus psyllid vector with reflective mulches and beneficial insects.",
        "chemical": "Apply systemic insecticides (e.g., imidacloprid) to control psyllid vectors; no chemical cure exists for infected trees — removal is standard.",
    },
    "Peach with Bacterial Spot": {
        "organic": "Plant resistant varieties and apply copper-based bactericide sprays during dormancy and early leaf-out.",
        "chemical": "Apply an oxytetracycline or copper spray program timed to shuck split and early fruit development.",
    },
    "Healthy Peach Plant": {
        "organic": "No treatment needed — maintain dormant-season copper spray as prevention if history of spot exists.",
        "chemical": "No treatment needed — standard fertility and pruning program is sufficient.",
    },
    "Bell Pepper with Bacterial Spot": {
        "organic": "Use certified disease-free seed, rotate crops, and apply copper-based bactericide sprays at first symptoms.",
        "chemical": "Apply a copper + mancozeb tank mix on a 7-day schedule during wet, warm weather.",
    },
    "Healthy Bell Pepper Plant": {
        "organic": "No treatment needed — rotate crops annually as prevention.",
        "chemical": "No treatment needed — standard fertility program is sufficient.",
    },
    "Potato with Early Blight": {
        "organic": "Rotate crops on a 2–3 year cycle, remove volunteer plants, and apply copper or Bacillus-based biofungicides at first spotting.",
        "chemical": "Apply a chlorothalonil or azoxystrobin fungicide on a 7–10 day interval once lesions appear.",
    },
    "Potato with Late Blight": {
        "organic": "Remove and destroy infected foliage immediately, avoid overhead irrigation, and apply copper-based fungicide preventively in humid weather.",
        "chemical": "Apply a chlorothalonil or mancozeb fungicide every 5–7 days during favorable (cool, wet) conditions; act fast, as late blight spreads rapidly.",
    },
    "Healthy Potato Plant": {
        "organic": "No treatment needed — rotate crops and hill soil to protect tubers.",
        "chemical": "No treatment needed — standard fertility program is sufficient.",
    },
    "Healthy Raspberry Plant": {
        "organic": "No treatment needed — prune out old canes after fruiting for airflow.",
        "chemical": "No treatment needed — routine fertilization program is sufficient.",
    },
    "Healthy Soybean Plant": {
        "organic": "No treatment needed — rotate crops as a general preventive measure.",
        "chemical": "No treatment needed — standard fertility program is sufficient.",
    },
    "Squash with Powdery Mildew": {
        "organic": "Apply sulfur, potassium bicarbonate, or neem oil sprays at first sign of white patches; increase plant spacing for airflow.",
        "chemical": "Apply a myclobutanil or trifloxystrobin fungicide at 7–14 day intervals once mildew appears.",
    },
    "Strawberry with Leaf Scorch": {
        "organic": "Remove infected leaves after harvest, avoid overhead watering, and use resistant varieties where available.",
        "chemical": "Apply a captan or myclobutanil fungicide starting at early leaf emergence in spring.",
    },
    "Healthy Strawberry Plant": {
        "organic": "No treatment needed — renovate beds and remove old foliage after harvest.",
        "chemical": "No treatment needed — standard fertility program is sufficient.",
    },
    "Tomato with Bacterial Spot": {
        "organic": "Use disease-free seed and copper-based bactericide sprays; avoid working in wet fields to reduce spread.",
        "chemical": "Apply a copper + mancozeb tank mix weekly during warm, wet conditions.",
    },
    "Tomato with Early Blight": {
        "organic": "Remove lower infected leaves, mulch to prevent soil splash, and apply copper or Bacillus-based biofungicides at first symptoms.",
        "chemical": "Apply a chlorothalonil or azoxystrobin fungicide on a 7–10 day schedule once spotting begins.",
    },
    "Tomato with Late Blight": {
        "organic": "Remove and destroy infected plants immediately, avoid overhead watering, and apply copper fungicide preventively in cool, humid weather.",
        "chemical": "Apply a chlorothalonil or mancozeb fungicide every 5–7 days during outbreaks; late blight can destroy a crop within days.",
    },
    "Tomato with Leaf Mold": {
        "organic": "Improve greenhouse or field ventilation and reduce humidity; apply copper-based fungicide at first sign of yellow spotting.",
        "chemical": "Apply a chlorothalonil or mancozeb fungicide at 7-day intervals, focusing on leaf undersides.",
    },
    "Tomato with Septoria Leaf Spot": {
        "organic": "Remove infected lower leaves, mulch to reduce soil splash, and rotate crops for at least one year.",
        "chemical": "Apply a chlorothalonil fungicide on a 7–10 day schedule starting at first spotting.",
    },
    "Tomato with Spider Mites or Two-spotted Spider Mite": {
        "organic": "Spray leaves (especially undersides) with water or insecticidal soap, and introduce predatory mites as biological control.",
        "chemical": "Apply a miticide such as abamectin or bifenthrin, rotating modes of action to prevent resistance.",
    },
    "Tomato with Target Spot": {
        "organic": "Remove infected debris, avoid overhead irrigation, and apply copper-based fungicide at first symptoms.",
        "chemical": "Apply a chlorothalonil or azoxystrobin fungicide on a 7–10 day interval during humid conditions.",
    },
    "Tomato Yellow Leaf Curl Virus": {
        "organic": "Control whitefly vectors with reflective mulch and insecticidal soap; remove and destroy infected plants promptly.",
        "chemical": "Apply a systemic insecticide (e.g., imidacloprid) to manage whitefly populations; no chemical cure exists for infected plants.",
    },
    "Tomato Mosaic Virus": {
        "organic": "Remove and destroy infected plants, wash hands and tools between plants, and avoid tobacco use near plants (mosaic virus is tobacco-transmissible).",
        "chemical": "No chemical cure exists; focus on sanitation and resistant varieties for future plantings.",
    },
    "Healthy Tomato Plant": {
        "organic": "No treatment needed — maintain crop rotation and monitor regularly.",
        "chemical": "No treatment needed — standard fertility program is sufficient.",
    },
}

_FALLBACK_TREATMENT = {
    "organic": "No specific guidance available for this class yet.",
    "chemical": "No specific guidance available for this class yet.",
}


def get_treatment(raw_label: str):
    return TREATMENTS.get(raw_label, _FALLBACK_TREATMENT)

def split_label(raw_label: str):
    if raw_label in LABEL_INFO:
        return LABEL_INFO[raw_label]
    return raw_label, "Unknown", False