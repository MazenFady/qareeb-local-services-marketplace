/**
 * Qareeb (قريب) — Realistic Mock Data Engine
 * High fidelity mock data for Barbers, Salons, Spas, Bookings, Applications & Reviews.
 */
window.Qareeb = window.Qareeb || {};

window.Qareeb.mockData = {
  // Service Categories
  categories: [
    { id: "barber", icon: "✂️", nameEn: "Barbershops & Grooming", nameAr: "صالونات الحلاقة والعناية الرجالية", count: 28 },
    { id: "hair", icon: "💇", nameEn: "Hair Salons & Styling", nameAr: "تصفيف وتلوين الشعر", count: 42 },
    { id: "nails", icon: "💅", nameEn: "Nails & Pedicure", nameAr: "العناية بالأظافر والبديكير", count: 19 },
    { id: "spa", icon: "🌿", nameEn: "Spa & Massage Therapy", nameAr: "السبا والتدليك العلاجي", count: 24 },
    { id: "facial", icon: "✨", nameEn: "Skincare & Facials", nameAr: "العناية بالبشرة والفيشل", count: 16 },
    { id: "makeup", icon: "💄", nameEn: "Bridal & Makeup", nameAr: "المكياج وإطلالات المناسبات", count: 14 }
  ],

  // Local Service Providers
  providers: [
    {
      id: "prov-1",
      nameEn: "The Royal Fade Gentlemen's Lounge",
      nameAr: "صالون الرويال فيد للعناية الرجالية",
      category: "barber",
      rating: 4.9,
      reviewsCount: 184,
      priceTier: "$$",
      startingPrice: 35,
      neighborhoodEn: "Downtown, Al Olaya",
      neighborhoodAr: "وسط المدينة، حي العليا",
      distanceEn: "1.2 km away",
      distanceAr: "على بعد 1.2 كم",
      heroImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
      avatarImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80",
      badges: ["topRated", "instant", "availableToday"],
      nextAvailableSlotEn: "Today at 3:15 PM",
      nextAvailableSlotAr: "اليوم الساعة 3:15 م",
      bioEn: "Premier gentleman's barber club combining bespoke grooming traditions with modern precision styling. Enjoy single-origin espresso, hot lather shaves, and tailored beard sculptures in a private club atmosphere.",
      bioAr: "صالون رجالي فاخر يجمع بين أصالة الحلاقة الكلاسيكية ودقة القصات الحديثة. استمتع بقهوة مختصة، وحلاقة بالرغوة الساخنة، ونحت اللحية المتقن في أجواء هادئة وخاصة.",
      highlights: ["hlYears", "hlHygiene", "hlAmenities", "hlParking", "hlMasterStylist"],
      addressEn: "74 King Fahd Road, Al Olaya District, Riyadh",
      addressAr: "طريق الملك فهد، حي العليا، الرياض",
      phone: "+966 50 892 4110",
      whatsapp: "+966508924110",
      instagram: "@royalfade_sa",
      facebook: "facebook.com/royalfadesa",
      coordinates: { x: 48, y: 52 },
      staff: [
        { id: "st-1", nameEn: "Omar Al-Mansoor", nameAr: "عمر المنصور", titleEn: "Master Barber & Beard Architect", titleAr: "كبير الحلاقين وخبير الذقن", rating: 4.9, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
        { id: "st-2", nameEn: "Tariq Zayn", nameAr: "طارق زين", titleEn: "Fade Specialist & Stylist", titleAr: "أخصائي التدريج والتسريحات", rating: 4.8, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
        { id: "st-3", nameEn: "Karim Samir", nameAr: "كريم سمير", titleEn: "Senior Grooming Consultant", titleAr: "استشاري العناية والبشرة", rating: 4.9, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" }
      ],
      services: [
        { id: "srv-101", titleEn: "Signature Executive Haircut", titleAr: "قصة الشعر الملكية الخاصة", descEn: "Includes consultation, precision scissor cut, energizing hair wash & style.", descAr: "تشمل استشارة، قص دقيق بالمقص والمكينة، غسيل منشط وتصفيف نهائي.", price: 40, duration: 45, categoryEn: "Haircuts", categoryAr: "قصات الشعر" },
        { id: "srv-102", titleEn: "Artisan Beard Sculpt & Hot Towel", titleAr: "نحت اللحية بالمنشفة الساخنة", descEn: "Blade sculpting, soothing botanical oils, hot and cold towel treatment.", descAr: "تحديد بالشفره مع زيوت ترطيب طبيعية، وعلاج بالمنشفة الساخنة والباردة.", price: 25, duration: 30, categoryEn: "Beard Care", categoryAr: "العناية باللحية" },
        { id: "srv-103", titleEn: "Royal Combo (Hair + Beard + Scalp)", titleAr: "الباقة الملكية المتكاملة (شعر + ذقن + مساج)", descEn: "Our full experience: signature cut, beard sculpting, herbal scalp massage.", descAr: "التجربة الكاملة: قصة شعر مميزة، نحت الذقن، ومساج عشبي لفروة الرأس.", price: 60, duration: 75, categoryEn: "Packages", categoryAr: "الباقات المميزة" },
        { id: "srv-104", titleEn: "Express Charcoal Facial Detox", titleAr: "تنظيف الوجه السريع بالفحم النشط", descEn: "Deep pore cleansing, dead skin exfoliation, hydrating mist finish.", descAr: "تنظيف مسام عميق، تقشير لطيف للجلد الميت، وترطيب منعش للبشرة.", price: 35, duration: 30, categoryEn: "Skincare", categoryAr: "العناية بالبشرة" }
      ],
      gallery: [
        { type: "venue", url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80", captionEn: "Executive styling stations", captionAr: "كراسي الحلاقة الكلاسيكية الفاخرة" },
        { type: "venue", url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80", captionEn: "Lounge and espresso bar", captionAr: "ركن القهوة المختصة والاستراحة" },
        { type: "work", url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80", captionEn: "Precision skin fade", captionAr: "تدريج شعر دقيق واحترافي" },
        { type: "work", url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80", captionEn: "Classic razor beard sculpting", captionAr: "نحت لحية متقن بالموس الكلاسيكي" }
      ],
      reviews: [
        { id: "rev-1", authorEn: "Faisal Al-Otaibi", authorAr: "فيصل العتيبي", rating: 5, dateEn: "Yesterday", dateAr: "أمس", textEn: "Flawless service as always. Omar is an artist with the blade and the vibe is exceptionally clean and relaxing.", textAr: "خدمة لا غبار عليها كالعادة. عمر مبدع جداً في نحت اللحية، والأجواء في الصالون قمة في النظافة والهدوء.", replyEn: "Thank you Faisal! Always a pleasure having you at the lounge.", replyAr: "شكراً لك أخي فيصل، تشرفنا دائماً بزيارتك الكريمة!" },
        { id: "rev-2", authorEn: "Saud Khalid", authorAr: "سعود خالد", rating: 5, dateEn: "3 days ago", dateAr: "قبل 3 أيام", textEn: "Booked through Qareeb in 30 seconds. Walked in and was seated immediately. Great hot towel treatment.", textAr: "حجزت عبر منصة قريب خلال ثوانٍ، وصلت وجلست مباشرة دون دقيقة انتظار. جلسة المنشفة الساخنة ممتازة.", replyEn: null, replyAr: null }
      ]
    },

    {
      id: "prov-2",
      nameEn: "Lumière Glow Skin & Wellness Spa",
      nameAr: "مركز لوميير جلو للعناية بالبشرة والسبا",
      category: "facial",
      rating: 4.8,
      reviewsCount: 142,
      priceTier: "$$$",
      startingPrice: 55,
      neighborhoodEn: "Al Rawdah / North Ring",
      neighborhoodAr: "حي الروضة / الدائري الشمالي",
      distanceEn: "2.4 km away",
      distanceAr: "على بعد 2.4 كم",
      heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      avatarImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=300&q=80",
      badges: ["topRated", "instant"],
      nextAvailableSlotEn: "Today at 4:45 PM",
      nextAvailableSlotAr: "اليوم الساعة 4:45 م",
      bioEn: "Boutique holistic aesthetic center providing state-of-the-art European hydra-facials, organic peel therapy, and rejuvenating tension-release treatments.",
      bioAr: "مركز تجميل واستجمام أوروبي يقدم جلسات الهيدرافيشل المتقدمة، والتقشير العضوي، وجلسات تجديد حيوية البشرة والاسترخاء التام.",
      highlights: ["hlYears", "hlHygiene", "hlAmenities", "hlMasterStylist"],
      addressEn: "12 Prince Sultan Road, Al Rawdah, Riyadh",
      addressAr: "شارع الأمير سلطان، حي الروضة، الرياض",
      phone: "+966 54 991 8820",
      whatsapp: "+966549918820",
      instagram: "@lumiere_glow_sa",
      facebook: "facebook.com/lumiereglow",
      coordinates: { x: 72, y: 35 },
      staff: [
        { id: "st-21", nameEn: "Dr. Elena Vance", nameAr: "د. إيلينا فانس", titleEn: "Lead Aesthetician & Dermatologist", titleAr: "كبيرة أخصائيات البشرة والتجميل", rating: 4.9, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" },
        { id: "st-22", nameEn: "Lina Al-Hassan", nameAr: "لينا الحسن", titleEn: "Skin Therapist", titleAr: "أخصائية العناية والمساج", rating: 4.8, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80" }
      ],
      services: [
        { id: "srv-201", titleEn: "Diamond Glow Hydra-Facial", titleAr: "جلسة هيدرافيشل دايموند جلو", descEn: "Infusion of active peptides and hyaluronic acid with deep vacuum extraction.", descAr: "حقن الببتيدات النشطة وحمض الهيالورونيك مع تنظيف عميق للمسام.", price: 85, duration: 60, categoryEn: "Facials", categoryAr: "جلسات الوجه" },
        { id: "srv-202", titleEn: "Rose Quartz Face Sculpt & Lymphatic Drainage", titleAr: "مساج نحت الوجه بأحجار الكوارتز", descEn: "De-puffs and lifts facial contours using cold cryo sticks and quartz rollers.", descAr: "تحفيز التصريف اللمفاوي وشد ملامح الوجه بأحجار الكوارتز الباردة.", price: 65, duration: 45, categoryEn: "Facials", categoryAr: "جلسات الوجه" },
        { id: "srv-203", titleEn: "Aromatherapy Full Body Relaxation", titleAr: "جلسة مساج استرخائي بالزيوت العطرية", descEn: "Pure organic lavender & eucalyptus essential oils with medium pressure.", descAr: "تدليك مهدئ بزيوت اللافندر والكينا العضوية لتخفيف التوتر والإرهاق.", price: 95, duration: 60, categoryEn: "Wellness", categoryAr: "الاسترخاء والسبا" }
      ],
      gallery: [
        { type: "venue", url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", captionEn: "Calm private treatment suite", captionAr: "غرف العلاج والاستجمام الخاصة" },
        { type: "work", url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80", captionEn: "Glow skin revitalization", captionAr: "نضارة ونقاء فوري للبشرة" }
      ],
      reviews: [
        { id: "rev-201", authorEn: "Reem Al-Dossary", authorAr: "ريم الدوسري", rating: 5, dateEn: "4 days ago", dateAr: "قبل 4 أيام", textEn: "The hydra facial results are incredible! My skin looks radiant for my brother's wedding.", textAr: "نتائج الهيدرافيشل مذهلة تماماً! بشرتي مشرقة ومستعدة لمناسبة زواج أخي.", replyEn: null, replyAr: null }
      ]
    },

    {
      id: "prov-3",
      nameEn: "Velvet & Co. Hair Atelier",
      nameAr: "صالون فيلفيت آند كو لتصفيف الشعر",
      category: "hair",
      rating: 4.9,
      reviewsCount: 220,
      priceTier: "$$$",
      startingPrice: 50,
      neighborhoodEn: "Al Nakheel District",
      neighborhoodAr: "حي النخيل، طريق التخصصي",
      distanceEn: "3.1 km away",
      distanceAr: "على بعد 3.1 كم",
      heroImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
      avatarImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
      badges: ["topRated", "availableToday"],
      nextAvailableSlotEn: "Today at 5:30 PM",
      nextAvailableSlotAr: "اليوم الساعة 5:30 م",
      bioEn: "Award-winning Parisian-trained colorists and stylists specializing in custom balayage, botanical keratin restoration, and red-carpet blowouts.",
      bioAr: "فريق معتمد تلقى تدريبه في باريس، متخصصون في صبغات البالياج المبتكرة، وعلاجات الكيراتين العضوية، والتسريحات الراقية للمناسبات.",
      highlights: ["hlYears", "hlHygiene", "hlParking", "hlMasterStylist"],
      addressEn: "88 Takhassusi St, Al Nakheel, Riyadh",
      addressAr: "شارع التخصصي، حي النخيل، الرياض",
      phone: "+966 56 332 1990",
      whatsapp: "+966563321990",
      instagram: "@velvet_hair_atelier",
      facebook: "facebook.com/velvethair",
      coordinates: { x: 30, y: 40 },
      staff: [
        { id: "st-31", nameEn: "Chloe Dupont", nameAr: "كلوي دوبون", titleEn: "Artistic Creative Director", titleAr: "المديرة الإبداعية للألوان", rating: 5.0, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" }
      ],
      services: [
        { id: "srv-301", titleEn: "Signature Couture Cut & Blowdry", titleAr: "قص وتصفيف كوتور الاحترافي", descEn: "Personalized hair architecture tailored to face shape and natural texture.", descAr: "قصة شعر مصممة هندسياً بما يلائم ملامح الوجه ونوعية الشعر.", price: 65, duration: 60, categoryEn: "Haircuts", categoryAr: "القص والتصفيف" },
        { id: "srv-302", titleEn: "Hand-Painted Balayage & Gloss", titleAr: "صبغة بالياج يدوي مع غلوس لمعان", descEn: "Seamless multi-dimensional sun-kissed lightening with bond builder.", descAr: "تفتيح طبيعي متدرج ثلاثي الأبعاد مع حماية ألياف الشعر بالبوند.", price: 160, duration: 150, categoryEn: "Coloring", categoryAr: "الصبغات والهايلايت" }
      ],
      gallery: [
        { type: "venue", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80", captionEn: "Sunlit studio floor", captionAr: "مساحة الصالون العصرية المضيئة" }
      ],
      reviews: [
        { id: "rev-301", authorEn: "Maha Al-Subaie", authorAr: "مها السبيعي", rating: 5, dateEn: "1 week ago", dateAr: "قبل أسبوع", textEn: "The only salon I trust with my blonde balayage. Zero brassiness and healthy hair.", textAr: "الصالون الوحيد الذي أثق به في صبغة البالياج، لون نقي دون أي اصفرار وشعر صحي.", replyEn: null, replyAr: null }
      ]
    },

    {
      id: "prov-4",
      nameEn: "Oasis Moroccan Bath & Massage Spa",
      nameAr: "سبا واحة الحمام المغربي والتدليك",
      category: "spa",
      rating: 4.7,
      reviewsCount: 96,
      priceTier: "$$",
      startingPrice: 45,
      neighborhoodEn: "Al Malqa / North",
      neighborhoodAr: "حي الملقا / شمال الرياض",
      distanceEn: "4.5 km away",
      distanceAr: "على بعد 4.5 كم",
      heroImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80",
      avatarImage: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=300&q=80",
      badges: ["instant", "availableToday"],
      nextAvailableSlotEn: "Today at 6:00 PM",
      nextAvailableSlotAr: "اليوم الساعة 6:00 م",
      bioEn: "Authentic heated marble steam chambers, traditional black olive soap exfoliation with Kessa loofah, and soothing deep-tissue body recovery therapy.",
      bioAr: "أجواء مغربية أصيلة مع غرف البخار الرخامية المسخنة، وتقشير بالصابون البلدي الأسود، ومساج عميق لتفريغ الإجهاد العضلي.",
      highlights: ["hlYears", "hlHygiene", "hlAmenities", "hlParking"],
      addressEn: "45 Anas Ibn Malik St, Al Malqa, Riyadh",
      addressAr: "شارع أنس بن مالك، حي الملقا، الرياض",
      phone: "+966 55 771 2004",
      whatsapp: "+966557712004",
      instagram: "@oasis_spa_sa",
      facebook: "facebook.com/oasisspasa",
      coordinates: { x: 20, y: 75 },
      staff: [
        { id: "st-41", nameEn: "Youssef Bennani", nameAr: "يوسف البناني", titleEn: "Senior Spa Practitioner", titleAr: "معالج استرخاء أول", rating: 4.8, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" }
      ],
      services: [
        { id: "srv-401", titleEn: "Royal Imperial Moroccan Bath", titleAr: "الحمام الملكي الإمبراطوري", descEn: "Eucalyptus steam, organic black soap, loofah scrub, Ghassoul clay wrap.", descAr: "بخار الكينا، صابون أسود عضوي، تقشير بالكيس، قناع طمي الغاسول المغربي.", price: 70, duration: 60, categoryEn: "Hammam", categoryAr: "الحمام المغربي" },
        { id: "srv-402", titleEn: "Deep Muscle Recovery Massage", titleAr: "مساج علاجي عميق لتفكيك العضلات", descEn: "Focused trigger point therapy with warm argan oil.", descAr: "تدليك نقطي للضغط لتفكيك التشنجات العضلية بزيت الأركان الدافئ.", price: 65, duration: 60, categoryEn: "Massage", categoryAr: "جلسات التدليك" }
      ],
      gallery: [
        { type: "venue", url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80", captionEn: "Warm marble steam chamber", captionAr: "غرفة البخار والرخام الدافئ" }
      ],
      reviews: [
        { id: "rev-401", authorEn: "Abdullah Al-Shehri", authorAr: "عبدالله الشهري", rating: 5, dateEn: "2 days ago", dateAr: "قبل يومين", textEn: "Pure relaxation. The scrub leaves your skin feeling brand new. Highly recommended.", textAr: "راحة استثنائية بعد أسبوع عمل طويل، التقشير ينعش الجسم بالكامل. أنصح به بشدة.", replyEn: null, replyAr: null }
      ]
    },

    {
      id: "prov-5",
      nameEn: "Polished Chic Nail Lounge",
      nameAr: "صالون بولشيد تشيك للأظافر والبديكير",
      category: "nails",
      rating: 4.8,
      reviewsCount: 115,
      priceTier: "$$",
      startingPrice: 30,
      neighborhoodEn: "Al Sulaimaniyah",
      neighborhoodAr: "حي السليمانية، شارع العروبة",
      distanceEn: "1.8 km away",
      distanceAr: "على بعد 1.8 كم",
      heroImage: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80",
      avatarImage: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=300&q=80",
      badges: ["topRated"],
      nextAvailableSlotEn: "Tomorrow at 11:00 AM",
      nextAvailableSlotAr: "غداً الساعة 11:00 ص",
      bioEn: "Modern minimalist nail salon dedicated to hygienic non-toxic gel manicures, Russian dry technique cuticle care, and bespoke minimalist nail art.",
      bioAr: "صالون أظافر عصري يهتم بالتعقيم التام، وتقنية المانيكير الروسي الجاف، وطلاء الجل الخالي من السموم مع تصاميم فنية مميزة.",
      highlights: ["hlHygiene", "hlAmenities", "hlMasterStylist"],
      addressEn: "33 Urubah Road, Al Sulaimaniyah, Riyadh",
      addressAr: "طريق العروبة، حي السليمانية، الرياض",
      phone: "+966 53 118 4722",
      whatsapp: "+966531184722",
      instagram: "@polishedchic_sa",
      facebook: "facebook.com/polishedchic",
      coordinates: { x: 55, y: 65 },
      staff: [
        { id: "st-51", nameEn: "Sarah Kim", nameAr: "سارة كيم", titleEn: "Nail Artist & Russian Manicurist", titleAr: "فنانة أظافر وأخصائية بديكير روسي", rating: 4.9, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" }
      ],
      services: [
        { id: "srv-501", titleEn: "Russian Dry Manicure & Biab Gel", titleAr: "مانيكير روسي جاف مع جل بياب المقوي", descEn: "Ultra-clean e-file cuticle work with builder gel strengthening.", descAr: "تنظيف دقيق للزوائد بالرؤوس الدوارة مع طبقة جل مغذية ومقوية للأظافر.", price: 50, duration: 60, categoryEn: "Nails", categoryAr: "الأظافر" },
        { id: "srv-502", titleEn: "Detox Spa Pedicure & Foot Massage", titleAr: "بديكير سبا بالملح البحري ومساج القدمين", descEn: "Dead Sea salt soak, callused skin smoothing, organic shea butter massage.", descAr: "نقع بأملاح البحر الميت، تنعيم الكعب، وتدليك بزبدة الشيا العضوية.", price: 45, duration: 50, categoryEn: "Pedicure", categoryAr: "البديكير" }
      ],
      gallery: [
        { type: "work", url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80", captionEn: "Minimalist French Gel Art", captionAr: "تصميم فرينش ناعم بطلاء الجل" }
      ],
      reviews: [
        { id: "rev-501", authorEn: "Nouf Al-Mutairi", authorAr: "نوف المطيري", rating: 5, dateEn: "3 days ago", dateAr: "قبل 3 أيام", textEn: "The cleanest nail salon in town. Tools are opened from sealed sterile pouches in front of you.", textAr: "أنظف صالون أظافر في الرياض بلا منازع، يتم فتح الأدوات المعقمة من الأكياس المغلقة أمامك مباشرة.", replyEn: null, replyAr: null }
      ]
    }
  ],

  // Customer Initial Bookings
  customerBookings: [
    {
      id: "BK-8021",
      providerId: "prov-1",
      providerNameEn: "The Royal Fade Gentlemen's Lounge",
      providerNameAr: "صالون الرويال فيد للعناية الرجالية",
      serviceId: "srv-101",
      serviceNameEn: "Signature Executive Haircut",
      serviceNameAr: "قصة الشعر الملكية الخاصة",
      specialistNameEn: "Omar Al-Mansoor",
      specialistNameAr: "عمر المنصور",
      dateStr: "Tomorrow",
      timeStr: "3:30 PM",
      price: 40,
      duration: 45,
      status: "confirmed", // confirmed | pending | completed | cancelled
      notesEn: "First visit, prefer low fade.",
      notesAr: "أول زيارة، أفضل تدريج منخفض.",
      createdAt: "2026-11-18"
    },
    {
      id: "BK-7940",
      providerId: "prov-2",
      providerNameEn: "Lumière Glow Skin & Wellness Spa",
      providerNameAr: "مركز لوميير جلو للعناية بالبشرة والسبا",
      serviceId: "srv-201",
      serviceNameEn: "Diamond Glow Hydra-Facial",
      serviceNameAr: "جلسة هيدرافيشل دايموند جلو",
      specialistNameEn: "Dr. Elena Vance",
      specialistNameAr: "د. إيلينا فانس",
      dateStr: "Nov 22, 2026",
      timeStr: "5:00 PM",
      price: 85,
      duration: 60,
      status: "pending",
      notesEn: "Sensitive skin around cheeks.",
      notesAr: "بشرة حساسة في منطقة الخدين.",
      createdAt: "2026-11-17"
    },
    {
      id: "BK-6512",
      providerId: "prov-4",
      providerNameEn: "Oasis Moroccan Bath & Massage Spa",
      providerNameAr: "سبا واحة الحمام المغربي والتدليك",
      serviceId: "srv-401",
      serviceNameEn: "Royal Imperial Moroccan Bath",
      serviceNameAr: "الحمام الملكي الإمبراطوري",
      specialistNameEn: "Youssef Bennani",
      specialistNameAr: "يوسف البناني",
      dateStr: "Nov 10, 2026",
      timeStr: "4:00 PM",
      price: 70,
      duration: 60,
      status: "completed",
      notesEn: "Excellent service.",
      notesAr: "خدمة ممتازة ومريحة.",
      createdAt: "2026-11-09"
    }
  ],

  // Service Provider Today's Schedule & Requests (for "prov-1")
  providerSchedule: [
    { id: "slot-1", time: "10:30 AM", clientName: "Fahad Al-Hassan", serviceEn: "Signature Haircut", serviceAr: "قصة شعر كلاسيكية", specialistEn: "Omar Al-Mansoor", specialistAr: "عمر المنصور", price: 40, status: "completed" },
    { id: "slot-2", time: "11:45 AM", clientName: "Khalid Bin Sultan", serviceEn: "Beard Sculpt & Hot Towel", serviceAr: "نحت اللحية والمنشفة الساخنة", specialistEn: "Tariq Zayn", specialistAr: "طارق زين", price: 25, status: "completed" },
    { id: "slot-3", time: "02:15 PM", clientName: "Rakan Al-Ghamdi", serviceEn: "Royal Combo (Hair + Beard)", serviceAr: "الباقة الملكية المتكاملة", specialistEn: "Omar Al-Mansoor", specialistAr: "عمر المنصور", price: 60, status: "confirmed" },
    { id: "slot-4", time: "03:45 PM", clientName: "Majed Al-Mutlaq", serviceEn: "Signature Haircut", serviceAr: "قصة شعر كلاسيكية", specialistEn: "Karim Samir", specialistAr: "كريم سمير", price: 40, status: "confirmed" },
    { id: "slot-5", time: "05:15 PM", clientName: "Nasser Al-Dahlawi", serviceEn: "Express Charcoal Facial", serviceAr: "تنظيف الوجه بالفحم", specialistEn: "Karim Samir", specialistAr: "كريم سمير", price: 35, status: "confirmed" }
  ],

  // Incoming booking requests for the provider
  incomingRequests: [
    { id: "req-1", clientName: "Sami Al-Harbi", phone: "+966 50 442 8199", serviceEn: "Royal Combo (Hair + Beard)", serviceAr: "الباقة الملكية المتكاملة", timeEn: "Today at 6:45 PM", timeAr: "اليوم الساعة 6:45 م", price: 60, specialistEn: "Omar Al-Mansoor", specialistAr: "عمر المنصور" },
    { id: "req-2", clientName: "Bader Al-Shammari", phone: "+966 55 901 3211", serviceEn: "Artisan Beard Sculpt", serviceAr: "نحت اللحية بالمنشفة الساخنة", timeEn: "Tomorrow at 1:15 PM", timeAr: "غداً الساعة 1:15 م", price: 25, specialistEn: "Tariq Zayn", specialistAr: "طارق زين" }
  ],

  // Provider Working Hours Settings
  providerHours: [
    { dayKey: "dayMonday", open: "10:00 AM", close: "10:00 PM", active: true },
    { dayKey: "dayTuesday", open: "10:00 AM", close: "10:00 PM", active: true },
    { dayKey: "dayWednesday", open: "10:00 AM", close: "10:00 PM", active: true },
    { dayKey: "dayThursday", open: "10:00 AM", close: "11:30 PM", active: true },
    { dayKey: "dayFriday", open: "01:30 PM", close: "11:30 PM", active: true },
    { dayKey: "daySaturday", open: "10:00 AM", close: "10:00 PM", active: true },
    { dayKey: "daySunday", open: "10:00 AM", close: "08:00 PM", active: false } // Day off
  ],

  // Platform Admin Data
  adminStats: {
    activeProviders: 148,
    registeredCustomers: "4,230",
    monthlyBookings: "12,850",
    grossVolume: "$412,500",
    satisfactionScore: "4.9 / 5"
  },

  // Admin Pending Provider Verification Queue
  pendingApprovals: [
    {
      id: "app-101",
      businessNameEn: "Golden Scissor Grooming Co.",
      businessNameAr: "صالون المقص الذهبي للحلاقة",
      category: "barber",
      ownerName: "Walid Al-Sharif",
      phone: "+966 50 671 2289",
      submittedDate: "2 hours ago",
      commercialRegNumber: "CR-1010892241",
      licenseStatus: "verified",
      photosCount: 6
    },
    {
      id: "app-102",
      businessNameEn: "Sultana Organic Beauty Lounge",
      businessNameAr: "مركز سلطانة للتجميل العضوي",
      category: "facial",
      ownerName: "Noura Al-Hammad",
      phone: "+966 54 819 5500",
      submittedDate: "Yesterday",
      commercialRegNumber: "CR-1010774390",
      licenseStatus: "pending_review",
      photosCount: 8
    },
    {
      id: "app-103",
      businessNameEn: "Zen Harmony Holistic Spa",
      businessNameAr: "سبا زين هارموني للاستجمام",
      category: "spa",
      ownerName: "Hamad Al-Qahtani",
      phone: "+966 55 330 9182",
      submittedDate: "3 days ago",
      commercialRegNumber: "CR-1010645112",
      licenseStatus: "verified",
      photosCount: 12
    }
  ],

  // Admin Flagged Content Moderation Queue
  flaggedReviews: [
    {
      id: "mod-1",
      providerNameEn: "Velvet & Co. Hair Atelier",
      providerNameAr: "صالون فيلفيت آند كو لتصفيف الشعر",
      reviewerName: "Anonymous Client",
      date: "Nov 16, 2026",
      flagReasonKey: "flagSpam",
      reportedTextEn: "Do not go here, visit our new shop on Olaya street instead for 50% discount call 0555...",
      reportedTextAr: "لا تذهبوا إلى هذا المكان، زوروا محلنا الجديد في شارع العليا بخصم 50% اتصل على 0555...",
      status: "pending"
    },
    {
      id: "mod-2",
      providerNameEn: "Oasis Moroccan Bath",
      providerNameAr: "سبا واحة الحمام المغربي والتدليك",
      reviewerName: "Tariq K.",
      date: "Nov 14, 2026",
      flagReasonKey: "flagDispute",
      reportedTextEn: "They charged me $10 extra for special soap that wasn't listed on the app menu.",
      reportedTextAr: "طلبوا مني مبلغ 10 دولارات إضافية مقابل صابون خاص لم يكن مذكوراً في القائمة داخل التطبيق.",
      status: "pending"
    }
  ],

  // Admin Blacklisted Keywords
  blockedKeywords: [
    "scam", "cheat", "fraud", "whatsapp me", "call my number", "discount code",
    "نصب", "احتيال", "تواصل واتساب", "رقمي الخاص", "تخفيض خارجي", "كذاب"
  ]
};
