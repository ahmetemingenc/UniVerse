import { ShieldCheck, AlertTriangle, Lock, Database, ExternalLink, UserCheck, CheckCircle } from 'lucide-react';

type ListItem = { text: string };
type Paragraph = { heading?: string; text: string; isCritical?: boolean };

const sections: {
    number: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    items?: ListItem[];
    paragraphs?: Paragraph[];
}[] = [
    {
        number: "1",
        title: "Toplanan Kişisel Verileriniz",
        icon: <Database size={15} className="text-cyan-400" />,
        items: [
            { text: "Kimlik Bilgileri: Adınız, soyadınız, kullanıcı adınız, doğum tarihiniz." },
            { text: "İletişim Bilgileri: Kişisel e-posta adresiniz, telefon numaranız." },
            { text: "Akademik / Öğrenci Bilgileri: Üniversite adınız, .edu veya üniversite uzantılı kurumsal e-posta adresiniz (edu_email) ve öğrenci doğrulama durumunuz." },
            { text: "Görsel Veriler: Profil sayfanıza yüklediğiniz profil fotoğrafınız ve ilanlara eklediğiniz ürün/ilan fotoğrafları." },
            { text: "Kullanım ve İşlem Verileri: Yayınladığınız ilanlar, yaptığınız iş/burs başvuruları, gönderdiğiniz teklifler, favoriye veya koleksiyonlarınıza eklediğiniz ilanlar, Platform içi mesajlaşma geçmişiniz, ilan görüntülenme sayıları ve sistem içi hareketlerinizi kaydeden aktivite logları (ActivityLog)." },
        ],
    },
    {
        number: "2",
        title: "Kişisel Verilerin İşlenme Amaçları",
        icon: <CheckCircle size={15} className="text-violet-400" />,
        items: [
            { text: "Platform üzerinde kullanıcı hesabı oluşturulması ve profilinizin yönetilmesi." },
            { text: '"Onaylı Öğrenci" statüsünün belirlenebilmesi amacıyla üniversite e-posta adresinizin doğrulanması ve suiistimallerin önlenmesi.' },
            { text: "İlan yayınlama, teklif verme, koleksiyon oluşturma ve ilanlara başvuru süreçlerinin (özellikle iş/burs takibinin) yürütülmesi." },
            { text: "Kullanıcılar arasında güvenli iletişim ve entegre sohbet/mesajlaşma mekanizmasının sağlanması." },
            { text: "Platform içi puanlama ve değerlendirme sisteminin işletilmesi (Anlaşma doğrulaması yapılmış kullanıcıların satıcılara yorum yapabilmesi)." },
            { text: "Sistem güvenliğinin sağlanması, teknik sorunların tespiti ve yasal loglama yükümlülüklerinin yerine getirilmesi." },
        ],
    },
    {
        number: "3",
        title: "Saklama, Güvenlik ve Üçüncü Taraflara Aktarım",
        icon: <Lock size={15} className="text-emerald-400" />,
        paragraphs: [
            {
                heading: "Şifre Güvenliği (Kriptolama)",
                text: "Hesap şifreleriniz veritabanımızda yalın halde asla tutulmaz. Şifreleriniz, endüstri standardı olan güçlü bcrypt algoritması ile tek yönlü olarak hashlenerek kriptolu şekilde saklanır. Bu şifreler platform yöneticileri dahil hiç kimse tarafından okunamaz veya geri döndürülemez.",
            },
            {
                heading: "Altyapı ve Veri Saklama",
                text: "Kişisel verileriniz ve Platform hareketleriniz güvenli bulut sunucular üzerindeki MongoDB veritabanında saklanmaktadır. Profil fotoğraflarınız ve ilan görselleriniz ise güvenli depolama ve optimize hızlı dağıtım amacıyla üçüncü taraf bulut sağlayıcısı olan Cloudinary altyapısında barındırılır.",
            },
            {
                heading: "Yasal Zorunluluklar Dışında Aktarım Yasağı",
                text: "Verileriniz, yasal bir yargı mercii veya emniyet gücü tarafından resmi bir süreç dahilinde talep edilmediği müddetçe, reklam, pazarlama veya ticari amaçlarla asla üçüncü şahıslara veya kurumlara satılmaz ve aktarılmaz.",
            },
            {
                heading: "Veri Saklama Süresi ve Silme (Soft Delete)",
                text: 'Yayınladığınız ilanları veya ürettiğiniz içerikleri sildiğinizde, bu veriler arayüzde anında gizlenir ("Silindi" veya is_deleted: true olarak işaretlenir). Ancak geçmiş başvuru/teklif tutarlılıklarının korunması, loglama ve yasal yükümlülükler nedeniyle veritabanında güvenli bir şekilde saklanmaya devam edebilir.',
            },
        ],
    },
    {
        number: "4",
        title: "Harici Yönlendirmeler ve Linkler",
        subtitle: "Uyarı",
        icon: <ExternalLink size={15} className="text-rose-400" />,
        paragraphs: [
            {
                heading: undefined,
                text: "Platform üzerinde yer alan İş / Staj ve Burs ilanları, başvuru yapabilmeniz için sizi üçüncü taraf web sitelerine (application_url) yönlendirebilir. Bu harici sitelerin gizlilik politikaları ve veri işleme pratikleri Platformun kontrolü dışındadır. Yönlendirildiğiniz harici sitelerde başvuru yaparken paylaşacağınız verilerin güvenliğinden tamamen ilgili siteler sorumludur; Platformun bu konuda hiçbir yasal yükümlülüğü bulunmamaktadır.",
                isCritical: true,
            },
        ],
    },
    {
        number: "5",
        title: "Veri Sahibinin (Kullanıcının) Hakları",
        subtitle: "KVKK Madde 11 & GDPR",
        icon: <UserCheck size={15} className="text-cyan-400" />,
        items: [
            { text: "Kişisel verilerinizin işlenip işlenmediğini öğrenme." },
            { text: "Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme." },
            { text: "Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme." },
            { text: "Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme." },
            { text: "Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme (Hesap Ayarları sekmesinden bu bilgileri dilediğiniz zaman güncelleyebilirsiniz)." },
            { text: "Kişisel verilerinizin silinmesini veya yok edilmesini isteme." },
        ],
    },
    {
        number: "6",
        title: "Rıza ve Onay",
        icon: <ShieldCheck size={15} className="text-violet-400" />,
        paragraphs: [
            {
                heading: undefined,
                text: "Platforma kayıt olduğunuz, profil bilgilerinizi güncellediğiniz veya Platform hizmetlerini kullandığınız andan itibaren, işbu Gizlilik Politikası ve KVKK/GDPR Aydınlatma Metni'nde yer alan tüm şartları özgür iradenizle okuduğunuzu, anladığınızı ve kişisel verilerinizin burada belirtilen şartlar dahilinde işlenmesine, saklanmasına açıkça rıza gösterdiğinizi (açık rıza beyanı) kabul, beyan ve taahhüt edersiniz.",
            },
        ],
    },
];

export default function PrivacyPage() {
    return (
        <>
            <div
                className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
                style={{
                    backgroundColor: '#050505',
                    backgroundImage: `
                        radial-gradient(ellipse at 20% 30%, rgba(124, 58, 237, 0.07) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 70%, rgba(34, 211, 238, 0.05) 0%, transparent 50%),
                        linear-gradient(to bottom, #050505, #0B0B10)
                    `,
                }}
            />

            <div className="flex flex-col items-center w-full min-h-screen pb-24">
                <div className="w-full max-w-3xl mx-auto pt-28 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Header */}
                    <div className="mb-12">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">
                            <ShieldCheck size={13} />
                            <span>Yasal Belgeler</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-4">
                            Gizlilik{' '}
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                Politikası
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500">
                            Son güncelleme:{' '}
                            <span className="text-gray-400 font-medium">09 Haziran 2026</span>
                            <span className="ml-3 text-gray-600">·</span>
                            <span className="ml-3 text-gray-500">KVKK & GDPR Aydınlatma Metni</span>
                        </p>
                    </div>

                    {/* Intro card */}
                    <div className="mb-14 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="mt-0.5 shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <ShieldCheck size={16} className="text-emerald-400" />
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                İşbu Gizlilik Politikası ve Aydınlatma Metni, Platformun veri sorumlusu ve geliştirici ekibi olarak,
                                Platformu ziyaret eden, üye olan ve sunulan hizmetlerden yararlanan kullanıcıların{' '}
                                <span className="text-white font-semibold">6698 sayılı KVKK</span> ve{' '}
                                <span className="text-white font-semibold">AB Genel Veri Koruma Yönetmeliği (GDPR)</span>{' '}
                                uyarınca kişisel verilerinin toplanma şekilleri, işlenme amaçları, hukuki sebepleri ve hakları
                                konusunda bilgilendirilmesi amacıyla hazırlanmıştır.
                            </p>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="flex flex-col gap-6">
                        {sections.map((section) => (
                            <div
                                key={section.number}
                                className="group bg-black/40 backdrop-blur-xl border border-white/5 hover:border-emerald-500/20 rounded-3xl overflow-hidden transition-all duration-500"
                            >
                                {/* Section header */}
                                <div className="flex items-center gap-4 px-6 pt-6 pb-5 border-b border-white/5">
                                    <span className="font-mono text-xs font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg tracking-widest">
                                        {section.number.padStart(2, '0')}
                                    </span>
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="shrink-0">{section.icon}</span>
                                        <div>
                                            <h2 className="text-base font-black text-white leading-snug">
                                                {section.title}
                                            </h2>
                                            {section.subtitle && (
                                                <p className="text-xs text-gray-500 mt-0.5">{section.subtitle}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-5 space-y-3">
                                    {/* Bullet list items */}
                                    {section.items && (
                                        <ul className="space-y-2.5">
                                            {section.items.map((item, i) => {
                                                const [label, ...rest] = item.text.split(': ');
                                                const hasLabel = rest.length > 0;
                                                return (
                                                    <li
                                                        key={i}
                                                        className="flex gap-3 bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5"
                                                    >
                                                        <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                                                        <span className="text-sm text-gray-400 leading-relaxed">
                                                            {hasLabel ? (
                                                                <>
                                                                    <span className="font-bold text-gray-200">{label}:</span>{' '}
                                                                    {rest.join(': ')}
                                                                </>
                                                            ) : (
                                                                item.text
                                                            )}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}

                                    {/* Paragraphs */}
                                    {section.paragraphs && (
                                        <div className="space-y-3">
                                            {section.paragraphs.map((para, i) =>
                                                para.isCritical ? (
                                                    <div
                                                        key={i}
                                                        className="relative bg-rose-500/5 border border-rose-500/30 rounded-2xl p-5 overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-[50px]" />
                                                        <div className="flex items-center gap-2 mb-3 relative z-10">
                                                            <AlertTriangle size={13} className="text-rose-400" />
                                                            <span className="text-xs font-black text-rose-400 uppercase tracking-widest">
                                                                Dikkat
                                                            </span>
                                                        </div>
                                                        {para.heading && (
                                                            <p className="text-xs font-bold text-rose-300/80 mb-1.5 relative z-10">
                                                                {para.heading}
                                                            </p>
                                                        )}
                                                        <p className="text-sm text-rose-100/60 leading-relaxed relative z-10">
                                                            {para.text}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div
                                                        key={i}
                                                        className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4"
                                                    >
                                                        {para.heading && (
                                                            <p className="text-xs font-black text-gray-300 uppercase tracking-wide mb-2">
                                                                {para.heading}
                                                            </p>
                                                        )}
                                                        <p className="text-sm text-gray-400 leading-relaxed">{para.text}</p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <p className="mt-10 text-xs text-gray-600 text-center leading-relaxed">
                        Bu metin, Platforma üye olduğunuz veya Platformu kullandığınız andan itibaren geçerlidir.
                    </p>
                </div>
            </div>
        </>
    );
}