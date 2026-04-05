import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.services.models import Service

Service.objects.all().delete()

Service.objects.create(
    type="hijama", slug="hijama", name="Hijama Therapy", name_bn="হিজামা থেরাপি",
    description="Traditional cupping therapy based on Prophetic medicine.",
    description_bn="নবী (সা.) এর চিকিৎসা পদ্ধতি অনুযায়ী হিজামা থেরাপি।",
    full_description="Hijama (cupping therapy) is one of the most recommended treatments in Prophetic medicine. It involves placing cups on specific points of the body to draw out toxins and improve blood circulation.",
    full_description_bn="হিজামা (কাপিং থেরাপি) নবী (সা.) এর চিকিৎসা পদ্ধতির অন্যতম একটি চিকিৎসা। এটি শরীরের নির্দিষ্ট পয়েন্টে কাপ স্থাপন করে বিষাক্ত পদার্থ বের করে এবং রক্ত সঞ্চালন উন্নত করে।",
    duration_minutes=60, price_bdt=600, is_active=True, is_online=False, is_offline=True,
    icon_name="Droplets", image_url="",
    benefits=["Detoxifies the body", "Improves blood circulation", "Relieves pain", "Boosts immunity"],
    benefits_bn=["শরীর থেকে বিষাক্ত পদার্থ দূর করে", "রক্ত সঞ্চালন উন্নত করে", "ব্যথা উপশম করে", "রোগ প্রতিরোধ ক্ষমতা বাড়ায়"],
    what_to_expect=["Consultation with practitioner", "Cup placement on body", "Suction and blood extraction", "Post-care instructions"],
    what_to_expect_bn=["চিকিৎসকের সাথে পরামর্শ", "শরীরে কাপ স্থাপন", "সাকশন এবং রক্ত নিষ্কাশন", "চিকিৎসা পরবর্তী নির্দেশনা"],
    hijama_pricing={"minCups": 3, "pricePerCup": 200},
    mode_pricing={"offlinePriceBDT": 600, "offlineDurationMinutes": 60},
)

Service.objects.create(
    type="ruqyah", slug="ruqyah", name="Ruqyah Therapy", name_bn="রুকইয়াহ থেরাপি",
    description="Quranic healing for spiritual ailments and protection.",
    description_bn="আধ্যাত্মিক রোগ ও সুরক্ষার জন্য কুরআনিক চিকিৎসা।",
    full_description="Ruqyah is the practice of treating spiritual ailments through the recitation of Quran, authentic duas, and adhkar. It is a Sunnah-based healing method.",
    full_description_bn="রুকইয়াহ হলো কুরআন তিলাওয়াত, সহীহ দোয়া এবং যিকিরের মাধ্যমে আধ্যাত্মিক রোগের চিকিৎসা।",
    duration_minutes=45, price_bdt=1000, is_active=True, is_online=True, is_offline=True,
    icon_name="BookOpen", image_url="",
    benefits=["Spiritual cleansing", "Protection from evil eye", "Relief from anxiety", "Strengthens faith"],
    benefits_bn=["আধ্যাত্মিক পরিশুদ্ধি", "বদ নজর থেকে সুরক্ষা", "উদ্বেগ থেকে মুক্তি", "ঈমান মজবুত করে"],
    what_to_expect=["Initial assessment", "Quran recitation", "Dua and adhkar", "Follow-up guidance"],
    what_to_expect_bn=["প্রাথমিক মূল্যায়ন", "কুরআন তিলাওয়াত", "দোয়া ও যিকির", "ফলো-আপ নির্দেশনা"],
    mode_pricing={"onlinePriceBDT": 800, "offlinePriceBDT": 1000, "onlineDurationMinutes": 45, "offlineDurationMinutes": 45},
)

Service.objects.create(
    type="counseling", slug="counseling", name="Islamic Counseling", name_bn="ইসলামিক কাউন্সেলিং",
    description="Faith-based counseling for emotional and psychological well-being.",
    description_bn="মানসিক ও আবেগিক সুস্থতার জন্য ইসলামী কাউন্সেলিং।",
    full_description="Our Islamic counseling combines modern psychological approaches with Islamic principles to help you navigate life challenges while staying connected to your faith.",
    full_description_bn="আমাদের ইসলামী কাউন্সেলিং আধুনিক মনোবৈজ্ঞানিক পদ্ধতির সাথে ইসলামী নীতিমালার সমন্বয় করে।",
    duration_minutes=60, price_bdt=2000, is_active=True, is_online=True, is_offline=True,
    icon_name="Heart", image_url="",
    benefits=["Professional guidance", "Faith-based approach", "Confidential sessions", "Holistic healing"],
    benefits_bn=["পেশাদার নির্দেশনা", "ঈমানভিত্তিক পদ্ধতি", "গোপনীয় সেশন", "সামগ্রিক সুস্থতা"],
    what_to_expect=["Confidential intake", "One-on-one session", "Islamic perspective guidance", "Action plan"],
    what_to_expect_bn=["গোপনীয় তথ্য সংগ্রহ", "একান্ত সেশন", "ইসলামী দৃষ্টিকোণ", "কর্মপরিকল্পনা"],
    mode_pricing={"onlinePriceBDT": 1500, "offlinePriceBDT": 2000, "onlineDurationMinutes": 60, "offlineDurationMinutes": 60},
)

Service.objects.create(
    type="assessment", slug="assessment", name="Health Assessment", name_bn="স্বাস্থ্য মূল্যায়ন",
    description="Comprehensive health assessment combining spiritual and physical evaluation.",
    description_bn="আধ্যাত্মিক ও শারীরিক মূল্যায়নের সমন্বয়ে ব্যাপক স্বাস্থ্য মূল্যায়ন।",
    full_description="Our comprehensive health assessment evaluates your physical, emotional, and spiritual well-being to provide a complete picture of your health and recommend appropriate treatments.",
    full_description_bn="আমাদের ব্যাপক স্বাস্থ্য মূল্যায়ন আপনার শারীরিক, মানসিক এবং আধ্যাত্মিক সুস্থতা মূল্যায়ন করে।",
    duration_minutes=30, price_bdt=500, is_active=True, is_online=True, is_offline=True,
    icon_name="ClipboardCheck", image_url="",
    benefits=["Complete health overview", "Personalized recommendations", "Early issue detection", "Treatment roadmap"],
    benefits_bn=["সম্পূর্ণ স্বাস্থ্য পর্যালোচনা", "ব্যক্তিগত পরামর্শ", "প্রাথমিক সমস্যা শনাক্তকরণ", "চিকিৎসা পরিকল্পনা"],
    what_to_expect=["4-step questionnaire", "Practitioner review", "Personalized report", "Treatment recommendation"],
    what_to_expect_bn=["৪-ধাপের প্রশ্নপত্র", "চিকিৎসক পর্যালোচনা", "ব্যক্তিগত রিপোর্ট", "চিকিৎসা সুপারিশ"],
    mode_pricing={"onlinePriceBDT": 500, "offlinePriceBDT": 500, "onlineDurationMinutes": 30, "offlineDurationMinutes": 30},
)

print("All 4 services created successfully!")
