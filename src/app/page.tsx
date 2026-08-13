import Link from "next/link";

export default function Home() {
  return (
    <div className="grain flex min-h-full flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-end justify-between px-6 pb-4 pt-8">
        <div>
          <p className="text-xs tracking-[0.28em] text-gold">REMOTE FRONT DESK</p>
          <h1 className="mt-2 font-serif text-4xl text-navy md:text-5xl">おうち受付</h1>
        </div>
        <p className="hidden max-w-xs text-right text-sm leading-6 text-navy/70 md:block">
          入口の受付を、ご自宅の画面へ。
          <br />
          予定・到着・お話まで、ひと続きに。
        </p>
      </header>
      <div className="gold-rule mx-auto w-full max-w-5xl" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12">
        <section className="max-w-2xl">
          <h2 className="font-serif text-2xl leading-relaxed text-navy md:text-3xl">
            ホテルや会社の来客受付を、
            <br />
            自宅にいながら担当できます。
          </h2>
          <p className="mt-5 text-base leading-8 text-navy/75">
            本日の来客予定を管理し、お客様が受付に着くと管理者へすぐ届きます。
            ご用件があれば、その場でビデオとチャットで直接お話しできます。
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Link
            href="/reception"
            className="group rounded-3xl border border-[var(--line)] bg-paper p-8 shadow-[0_20px_50px_rgba(16,36,60,0.08)] transition hover:-translate-y-0.5 hover:border-gold/50"
          >
            <p className="text-xs tracking-[0.2em] text-gold">FOR VISITORS</p>
            <h3 className="mt-3 font-serif text-3xl text-navy">受付画面</h3>
            <p className="mt-4 text-sm leading-7 text-navy/70">
              入口やフロントのタブレット向け。お客様が到着を知らせたり、受付担当と直接通話できます。
            </p>
            <span className="mt-8 inline-flex text-sm font-semibold text-navy group-hover:text-gold">
              キオスクを開く →
            </span>
          </Link>

          <Link
            href="/admin"
            className="group rounded-3xl bg-navy p-8 text-ivory shadow-[0_20px_50px_rgba(16,36,60,0.18)] transition hover:-translate-y-0.5"
          >
            <p className="text-xs tracking-[0.2em] text-gold-soft">FOR STAFF AT HOME</p>
            <h3 className="mt-3 font-serif text-3xl">管理者画面</h3>
            <p className="mt-4 text-sm leading-7 text-ivory/75">
              ご自宅やバックヤードから、来客スケジュールの確認・登録、到着通知の受信、通話応答ができます。
            </p>
            <span className="mt-8 inline-flex text-sm font-semibold text-gold-soft">
              自宅から受付する →
            </span>
          </Link>
        </section>

        <section className="grid gap-6 rounded-3xl border border-[var(--line)] bg-paper/80 p-8 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "予定を入れる",
              d: "来客の日時・お名前・用件・担当者を登録。4桁の受付番号が発行されます。",
            },
            {
              n: "02",
              t: "到着が届く",
              d: "お客様が受付でお名前か番号を入れると、管理者画面に通知と音で知らせます。",
            },
            {
              n: "03",
              t: "その場で話す",
              d: "問い合わせやご案内はビデオ通話とチャットで。カメラが使えない場合も文字で話せます。",
            },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-serif text-gold">{s.n}</p>
              <h3 className="mt-2 text-lg font-semibold text-navy">{s.t}</h3>
              <p className="mt-2 text-sm leading-7 text-navy/70">{s.d}</p>
            </div>
          ))}
        </section>

        <p className="text-xs leading-6 text-navy/50">
          試すときはブラウザを2つ開き、一方を受付・他方を管理者にすると流れがわかります。
          初期の管理者暗証番号は <span className="font-mono">1234</span> です。本日分のサンプル予約（受付番号
          4821 / 7390 / 1564 / 8203）が入っています。
        </p>
      </main>
    </div>
  );
}
