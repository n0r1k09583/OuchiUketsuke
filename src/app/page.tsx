import Link from "next/link";
import { DemoGuide } from "@/components/DemoGuide";

export default function Home() {
  return (
    <div className="grain flex min-h-full flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-end justify-between px-6 pb-4 pt-8">
        <div>
          <p className="text-xs tracking-[0.28em] text-gold">INQUIRY FOR RECEPTION</p>
          <h1 className="mt-2 font-serif text-4xl text-navy md:text-5xl">おうち受付</h1>
        </div>
        <p className="hidden max-w-xs text-right text-sm leading-6 text-navy/70 md:block">
          受付の人のための、お問い合わせアプリ。
          <br />
          ホテルでも、会社でも。
        </p>
      </header>
      <div className="gold-rule mx-auto w-full max-w-5xl" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12">
        <section className="max-w-2xl">
          <h2 className="font-serif text-2xl leading-relaxed text-navy md:text-3xl">
            ホテルや会社の受付の人が、
            <br />
            使いやすいお問い合わせアプリです。
          </h2>
          <p className="mt-5 text-base leading-8 text-navy/75">
            お客様は入口から用件を伝えられます。受付担当は予定を見て、到着に気づき、
            ビデオやチャットでその場でお答えできます。現場にいなくても受付の仕事が続きます。
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
              お客様向け。到着の申告と、受付の人へのお問い合わせができます。
            </p>
            <span className="mt-8 inline-flex text-sm font-semibold text-navy group-hover:text-gold">
              キオスクを開く →
            </span>
          </Link>

          <Link
            href="/admin"
            className="group rounded-3xl bg-navy p-8 text-ivory shadow-[0_20px_50px_rgba(16,36,60,0.18)] transition hover:-translate-y-0.5"
          >
            <p className="text-xs tracking-[0.2em] text-gold-soft">FOR RECEPTION STAFF</p>
            <h3 className="mt-3 font-serif text-3xl">受付の人の画面</h3>
            <p className="mt-4 text-sm leading-7 text-ivory/75">
              スケジュール、到着通知、お問い合わせへの応答。自宅からでも使えます。
            </p>
            <span className="mt-8 inline-flex text-sm font-semibold text-gold-soft">
              受付担当として入る →
            </span>
          </Link>
        </section>

        <section className="grid gap-6 rounded-3xl border border-[var(--line)] bg-paper/80 p-8 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "予定を入れておく",
              d: "受付の人が来客の日時と用件を登録。番号が発行されます。",
            },
            {
              n: "02",
              t: "お問い合わせが届く",
              d: "お客様が入口から呼び出すと、受付担当の画面に着信します。",
            },
            {
              n: "03",
              t: "その場で応対する",
              d: "ビデオとチャット。カメラがなくても文字で案内できます。",
            },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-serif text-gold">{s.n}</p>
              <h3 className="mt-2 text-lg font-semibold text-navy">{s.t}</h3>
              <p className="mt-2 text-sm leading-7 text-navy/70">{s.d}</p>
            </div>
          ))}
        </section>

        <DemoGuide />
      </main>
    </div>
  );
}
