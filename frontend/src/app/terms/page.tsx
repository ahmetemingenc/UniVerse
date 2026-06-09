import { FileText, AlertTriangle, ShieldCheck } from 'lucide-react';

type Paragraph = {
    heading?: string;
    text: string;
    isCritical?: boolean;
};

export default function TermsPage() {
    const sections = [

        {
            number: "1",
            title: "Taraflar ve Tanımlar",
            items: [
                {
                    term: "Platform",
                    definition:
                        "Kullanıcıların ikinci el ürün satışı, ev/oda arkadaşlığı, yol arkadaşlığı, özel ders, iş/staj ve burs ilanları yayınlayabildiği, birbirleriyle iletişim kurabildiği web tabanlı yazılım ve hizmet bütünüdür.",
                },
                {
                    term: "Kullanıcı",
                    definition:
                        "Platforma kayıt olan ve hizmetlerden yararlanan tüm gerçek kişileri ifade eder.",
                },
                {
                    term: "Onaylı Öğrenci",
                    definition:
                        '.edu veya üniversite uzantılı e-posta adresini sistem üzerinden başarıyla doğrulayarak "Öğrenci" statüsü kazanan kullanıcıları ifade eder.',
                },
                {
                    term: "Sivil / Harici Kullanıcı",
                    definition:
                        "Öğrenci doğrulaması yapmamış veya öğrenci statüsünde olmayan genel kullanıcıları ifade eder.",
                },
            ],
        },
        {
            number: "2",
            title: "Hesap Güvenliği ve Doğrulama Sorumluluğu",
            paragraphs: [
                {
                    heading: "Doğru Beyan Yükümlülüğü",
                    text: "Kullanıcı, kayıt esnasında veya profilini güncellerken verdiği isim, soyisim, telefon, doğum tarihi ve üniversite gibi tüm bilgilerin doğru ve kendisine ait olduğunu kabul eder. Yanıltıcı, sahte veya başkasına ait bilgilerle hesap açılmasından doğacak tüm hukuki ve cezai sorumluluk Kullanıcı'ya aittir.",
                },
                {
                    heading: ".edu E-Posta Doğrulaması",
                    text: '"Onaylı Öğrenci" statüsü kazanmak amacıyla sisteme girilen üniversite e-posta adresinin sorumluluğu tamamen Kullanıcı\'dadır. Başkasına ait akademik e-postaların kullanımı veya bu yolla haksız statü elde edilmesi durumunda Platform, hesabı kalıcı olarak askıya alma hakkını saklı tutar.',
                },
                {
                    heading: "Şifre ve Hesap Güvenliği",
                    text: "Şifreler sistemde kriptolu (bcrypt algoritması ile hashlenmiş) olarak saklanmaktadır. Ancak Kullanıcı, kendi hesap şifresinin ve erişim token'larının güvenliğinden kendisi sorumludur. Hesabın yetkisiz kişilerce kullanımından doğabilecek zararlardan Platform yöneticileri sorumlu tutulamaz.",
                },
            ],
        },
        {
            number: "3",
            title: "Kullanıcı Tarafından Oluşturulan İçerikler",
            subtitle: "İlanlar ve Yorumlar",
            paragraphs: [
                {
                    heading: "İçerik Sorumluluğu",
                    text: "Platform üzerinde yayınlanan tüm ilanların (İkinci El, Ev/Oda Arkadaşı, Yol Arkadaşı vb.) açıklamaları, fiyatları, özellikleri ve ilanlara yapılan yorumlar/puanlamalar tamamen içeriği üreten Kullanıcı'nın sorumluluğundadır.",
                },
                {
                    heading: "Yasalara Uygunluk",
                    text: "Kullanıcı; Platform üzerinde Türkiye Cumhuriyeti kanunlarına aykırı, telif haklarını ihlal eden, genel ahlaka aykırı, yanıltıcı, dolandırıcılık amacı güden, hakaret veya tehdit içeren ilan veya yorum yayınlayamaz.",
                },
                {
                    heading: "Platformun Denetim ve Silme Yetkisi",
                    text: "Platform, şikayet üzerine veya re'sen yasalara ve topluluk kurallarına aykırı gördüğü ilanları, başvuruları ve yorumları önceden haber vermeksizin silme, değiştirme veya erişime kapatma hakkına sahiptir.",
                },
                {
                    heading: "Veri Saklama Mantığı (Soft Delete)",
                    text: 'Kullanıcı kendi ilanını sildiğinde, bu ilan arayüzde "Silindi" olarak işaretlenir. Ancak veritabanı bütünlüğü, geçmiş başvuru/teklif takipleri ve yasal loglama gereksinimleri nedeniyle ilgili veri Platform veritabanında saklanmaya devam edebilir.',
                },
            ],
        },
        {
            number: "4",
            title: "İş/Staj ve Burs İlanları",
            subtitle: "Dış Bağlantı Sorumluluk Reddi",
            paragraphs: [
                {
                    heading: "Dış Bağlantılar (Harici Linkler)",
                    text: "Platform üzerinde listelenen İş / Staj ve Burs ilanları, kullanıcıları Platform dışındaki harici başvuru sitelerine veya formlarına (application_url) yönlendirebilir.",
                    isCritical: false,
                },
                {
                    heading: "Sorumluluk Sınırı",
                    text: "Platform, yönlendirilen bu harici sitelerin güvenliğini, doğruluğunu, içeriğini veya gizlilik politikalarını kontrol etmez ve garanti etmez. Kullanıcı, harici bağlantılara gitmeden önce Platform tarafından sunulan uyarı modalını onaylayarak kendi özgür iradesiyle ilerler. Bu harici sitelerde yaşanabilecek veri sızıntıları, maddi/manevi zararlar, taahhüt edilen burs veya işin gerçekleşmemesi ya da dolandırıcılık vakalarından Platform ve geliştiricileri kesinlikle sorumlu tutulamaz.",
                    isCritical: true,
                },
            ],
        },
        {
            number: "5",
            title: "Kullanıcılar Arası Etkileşim ve Anlaşmalar",
            paragraphs: [
                {
                    heading: "Teklif ve Anlaşma Sistemi",
                    text: "Platform; marketplace (ikinci el), ilan başvuruları ve sohbet içi teklif özellikleri sunmaktadır. Kabul edilen teklifler (Accepted Offer) sistem üzerinde yasal olarak bağlayıcı bir resmi sözleşme niteliği taşımaz; sadece taraflar arası iyi niyet beyanıdır.",
                },
                {
                    heading: "Ticari Sorumluluk Reddi",
                    text: "Platform, kullanıcılar arasında gerçekleşen alışverişlerde, yol arkadaşlığı paylaşımlarında, oda arkadaşlığı süreçlerinde veya özel ders ödemelerinde hiçbir şekilde aracı kurum, garantör veya ödeme sorumlusu değildir. Ödemeler, ürün teslimatları ve yaşanabilecek anlaşmazlıklar tamamen taraflar arasındadır.",
                },
            ],
        },
        {
            number: "6",
            title: "Gizlilik ve Veri İşleme",
            subtitle: "KVKK",
            paragraphs: [
                {
                    heading: undefined,
                    text: "Platform, Kullanıcı'ya ait kişisel verileri (İsim, soyisim, telefon, profil fotoğrafı vb.) Platform hizmetlerinin yürütülebilmesi, loglama sisteminin çalışması ve kullanıcılar arası güvenliğin sağlanması amacıyla Gizlilik Politikası'na uygun olarak işler. Kullanıcı şifreleri yöneticiler dahil hiç kimse tarafından yalın halde okunamaz. Detaylı bilgi için lütfen Gizlilik Politikası metnini inceleyiniz.",
                },
            ],
        },
        {
            number: "7",
            title: "Sözleşme Değişiklikleri ve Fesih",
            paragraphs: [
                {
                    heading: undefined,
                    text: "Platform, işbu Kullanım Koşulları Sözleşmesi'ni dilediği zaman tek taraflı olarak güncelleme veya değiştirme hakkına sahiptir. Değişiklikler Platform üzerinde yayınlandığı andan itibaren geçerlilik kazanır.",
                },
                {
                    heading: undefined,
                    text: "Sözleşme maddelerine aykırı davranan kullanıcıların hesapları, Platform tarafından geçici veya kalıcı olarak askıya alınabilir, içerikleri silinebilir.",
                },
                {
                    heading: undefined,
                    text: "İşbu sözleşme, Kullanıcı Platforma üye olduğu veya Platformu kullandığı andan itibaren yürürlüğe girer ve taraflar arasında hukuki olarak bağlayıcıdır.",
                },
            ],
        },
    ];

    return (
        <>
            {/* Same ambient background as homepage */}
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
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-black uppercase tracking-widest mb-6">
                            <ShieldCheck size={13} />
                            <span>Yasal Belgeler</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-4">
                            Kullanım{' '}
                            <span className="bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                                Koşulları
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500">
                            Son güncelleme: <span className="text-gray-400 font-medium">09 Haziran 2026</span>
                        </p>
                    </div>

                    {/* Intro card */}
                    <div className="mb-14 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="mt-0.5 shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                <FileText size={16} className="text-violet-400" />
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Lütfen bu platformu (bundan böyle "Platform" veya "Sistem" olarak anılacaktır) kullanmadan önce işbu Kullanım Koşulları Sözleşmesi'ni dikkatlice
                                okuyunuz. Platforma üye olan, ilan yayınlayan, ilanlara başvuran veya Platformu herhangi
                                bir şekilde kullanan tüm kullanıcılar, bu Sözleşme'de yer alan tüm maddeleri peşinen{' '}
                                <span className="text-white font-semibold">kabul etmiş, anlamış ve onaylamış</span> sayılır.
                            </p>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="flex flex-col gap-6">
                        {sections.map((section) => (
                            <div
                                key={section.number}
                                className="group bg-black/40 backdrop-blur-xl border border-white/5 hover:border-violet-500/20 rounded-3xl overflow-hidden transition-all duration-500"
                            >
                                {/* Section header bar */}
                                <div className="flex items-center gap-4 px-6 pt-6 pb-5 border-b border-white/5">
                                    <span className="font-mono text-xs font-black text-violet-500 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg tracking-widest">
                                        {section.number.padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h2 className="text-base font-black text-white leading-snug">
                                            {section.title}
                                        </h2>
                                        {section.subtitle && (
                                            <p className="text-xs text-gray-500 mt-0.5">{section.subtitle}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="px-6 py-5 space-y-4">
                                    {/* Definition list — Section 1 */}
                                    {'items' in section && section.items && (
                                        <dl className="space-y-3">
                                            {section.items.map((item) => (
                                                <div
                                                    key={item.term}
                                                    className="flex gap-4 bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4"
                                                >
                                                    <dt className="shrink-0 w-32 text-xs font-black text-cyan-400 uppercase tracking-wide mt-0.5">
                                                        {item.term}
                                                    </dt>
                                                    <dd className="text-sm text-gray-400 leading-relaxed">
                                                        {item.definition}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    )}

                                    {/* Paragraphs */}
                                    {'paragraphs' in section && section.paragraphs && (
                                        <div className="space-y-3">
                                            {section.paragraphs.map((para: Paragraph, i) =>
                                                para.isCritical ? (
                                                    /* Critical callout — rose, matches urgent listings style */
                                                    <div
                                                        key={i}
                                                        className="relative bg-rose-500/5 border border-rose-500/30 rounded-2xl p-5 overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-[50px]" />
                                                        <div className="flex items-center gap-2 mb-3 relative z-10">
                                                            <AlertTriangle size={13} className="text-rose-400" />
                                                            <span className="text-xs font-black text-rose-400 uppercase tracking-widest">
                                                                Kritik Madde
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
                                                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4">
                                                        {para.heading && (
                                                            <p className="text-xs font-black text-gray-300 uppercase tracking-wide mb-2">
                                                                {para.heading}
                                                            </p>
                                                        )}
                                                        <p className="text-sm text-gray-400 leading-relaxed">
                                                            {para.text}
                                                        </p>
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
                        Bu sözleşme, Platforma üye olduğunuz veya Platformu kullandığınız andan itibaren geçerlidir.
                    </p>
                </div>
            </div>
        </>
    );
}