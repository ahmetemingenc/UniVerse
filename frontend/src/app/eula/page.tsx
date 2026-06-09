export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto pt-32 pb-20 px-6 text-gray-300">
            <h1 className="text-4xl font-black text-white mb-8">Kullanım Koşulları</h1>
            <div className="prose prose-invert prose-blue max-w-none">
                SON KULLANICI LİSANS SÖZLEŞMESİ (EULA)
                Son Güncelleme Tarihi: 09.06.2026

                İşbu Son Kullanıcı Lisans Sözleşmesi ("Sözleşme"), Platform yazılımının, kaynak kodlarının, arayüz tasarımlarının, veritabanı yapısının ve sunulan dijital hizmetlerin (hepsi birlikte "Yazılım" veya "Platform" olarak anılacaktır) telif sahibi/geliştiricileri ile Platformu kullanan son kullanıcı ("Kullanıcı") arasında akdedilmiş yasal bir sözleşmedir.

                Platforma kayıt olunması, kaynak kodlarına erişilmesi, arayüzün kullanılması veya hizmetlerden yararlanılması, bu Sözleşme’nin tüm şartlarının Kullanıcı tarafından eksiksiz olarak kabul edildiği anlamına gelir.

                1. LİSANSIN VERİLMESİ VE KAPSAMI
                Sınırlı Lisans: Geliştirici, Kullanıcı’ya; Yazılımı yalnızca kişisel, ticari olmayan (ilan verme, başvuruda bulunma, mesajlaşma ve koleksiyon oluşturma amaçlı) amaçlarla kullanması için devredilemez, münhasır olmayan, geri alınabilir ve sınırlı bir kullanım lisansı vermektedir.

                Mülkiyet Hakkı: Bu Sözleşme Yazılım’ın veya kaynak kodlarının satışı anlamına gelmez. Yazılım'ın tüm mülkiyet, telif, patent ve diğer fikri mülkiyet hakları saklıdır ve tamamen geliştirici ekibine aittir.

                2. KULLANIM KISITLAMALARI VE YASAKLAR
                Kullanıcı, işbu sözleşme uyarınca aşağıdaki eylemleri gerçekleştirmeyeceğini veya üçüncü şahısların gerçekleştirmesine izin vermeyeceğini taahhüt eder:

                Tersine Mühendislik ve Kopyalama: Yazılımın kaynak kodlarını (Next.js frontend, Node.js/Express backend yapıları dahil) kopyalamak, tersine mühendislik (reverse engineering) yapmak, kaynak koda dönüştürmek (decompile) veya kaynak kodları üzerinde değişiklik yaparak alternatif bir platform türetmek kesinlikle yasaktır.

                Veri Madenciliği (Scraping): Platformda yer alan kullanıcı verilerini, ilanları, .edu doğrulamalı öğrenci listelerini veya telefon numaralarını botlar, web örümcekleri (crawlers) veya otomatik scriptler vasıtasıyla toplamak, çekmek (scraping) ve harici veritabanlarında saklamak yasaktır.

                Hizmetin Kötüye Kullanımı: API endpoint'lerine (örneğin /api/offer/apply veya /api/user/me/saved) DDoS, brute-force veya botlar aracılığıyla spam istekler göndererek sistemi manipüle etmek veya sunucuyu yavaşlatmaya çalışmak yasal işlem sebebidir.

                3. KULLANICI İÇERİKLERİ VE FİKRİ MÜLKİYET
                İçerik Lisansı: Kullanıcı, Platform üzerinde yayınladığı ilan metinleri, fotoğrafları (Cloudinary üzerinde saklanan görseller dahil) ve yorumlar üzerinde mülkiyet haklarını korur. Ancak Kullanıcı, bu içeriklerin Platform üzerinde sergilenmesi, listelenmesi ve sistemin işleyişi amacıyla kullanılabilmesi için Platforma dünya çapında, telifsiz ve kalıcı bir yayınlama lisansı vermiş sayılır.

                Loglama ve Yedekleme: Sistem güvenliği, aktivite logları (ActivityLog) ve veritabanı yedekleme protokolleri kapsamında, kullanıcının yaptığı işlemler ve yüklediği veriler yasal mevzuat sınırları dahilinde güvenli sunucularda saklanır.

                4. GARANTİ VERİLMEMESİ VE SORUMLULUĞUN SINIRLANDIRILMASI
                "Olduğu Gibi" (As-Is) Kullanım: Yazılım, Kullanıcı’ya "olduğu gibi" ve "mevcut haliyle" sunulmaktadır. Geliştirici; Yazılımın kesintisiz çalışacağını, tamamen hatasız olacağını veya belirli bir amaca (örneğin kesin iş/burs bulma veya kesin satış yapma) hizmet edeceğini garanti etmez.

                Zarar Sorumluluğu: Platform veya Platformda yer alan harici yönlendirme linkleri (application_url) nedeniyle Kullanıcı’nın cihazlarında meydana gelebilecek veri kayıplarından, yazılımsal/donanımsal çökmelerden veya kullanıcılar arası (Sivil/Öğrenci) etkileşimlerden doğabilecek hiçbir doğrudan veya dolaylı maddi/manevi zarardan Platform geliştiricileri sorumlu tutulamaz.

                5. LİSANSIN FESHİ VE HESAP ASKIYA ALMA
                İhlal Durumunda Fesih: Kullanıcı’nın bu Sözleşme’deki kısıtlamalardan herhangi birini (kod kopyalama, veri madenciliği, sahte .edu maili beyanı vb.) ihlal etmesi durumunda, işbu lisans ve Kullanıcı’nın Platforma erişim hakkı hiçbir ihbara gerek kalmaksızın otomatik olarak feshedilir.

                Verilerin Silinmesi/Saklanması: Lisansın feshi durumunda Kullanıcı’nın aktif ilanları sistemden kaldırılır; ancak sistem bütünlüğü ve yasal log gereksinimleri (soft delete mekanizması) uyarınca geçmiş veritabanı kayıtları saklanmaya devam edebilir.

                6. BÖLÜNEBİLİRLİK VE YETKİLİ MAHKEME
                Bu Sözleşme’nin herhangi bir maddesinin yasal olarak geçersiz veya uygulanamaz sayılması durumunda, söz konusu madde Sözleşme’den çıkarılmış kabul edilir ve Sözleşme’nin geri kalan maddeleri tam olarak yürürlükte kalmaya devam eder.

                Bu Sözleşme’den doğabilecek her türlü uyuşmazlığın çözümünde Türkiye Cumhuriyeti Kanunları geçerlidir ve İzmir Mahkemeleri ile İcra Daireleri yetkilidir.

                İşbu EULA sözleşmesi, Kullanıcı’nın Platformu kullanmaya başladığı veya hesap oluşturduğu andan itibaren yasal olarak bağlayıcı bir şekilde yürürlüğe girer.

            </div>
        </div>
    );
}