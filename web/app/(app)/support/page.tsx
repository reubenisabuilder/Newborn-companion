import { SUPPORT, type SupportOrg } from "@/lib/content/support";

function OrgList({ list }: { list: SupportOrg[] }) {
  return (
    <>
      {list.map((o) => (
        <div className="support-org" key={o.name}>
          <strong>{o.name}</strong>
          {o.contact ? " — " + o.contact : ""}
          <div className="small muted">{o.desc}</div>
          {o.url && (
            <div className="small">
              <a href={o.url} target="_blank" rel="noopener">
                {o.url.replace("https://", "")}
              </a>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default function SupportPage() {
  return (
    <>
      <div className="redflag">
        <h3>If you&apos;re not safe right now</h3>
        <p className="small">
          If you&apos;re having thoughts of harming yourself or your baby, or
          think you or your partner may be showing signs of postpartum
          psychosis (confusion, hallucinations, mania, feeling out of touch
          with reality) — this is an emergency. Call <strong>999</strong> or
          go to A&E.
        </p>
      </div>
      <div className="card">
        <h2>For Mum</h2>
        <OrgList list={SUPPORT.mum} />
      </div>
      <div className="card">
        <h2>For Dad</h2>
        <OrgList list={SUPPORT.dad} />
      </div>
      <div className="card">
        <h2>General</h2>
        <OrgList list={SUPPORT.general} />
      </div>
      <div className="card">
        <h3>Worth knowing</h3>
        <p className="small">
          The &quot;baby blues&quot; (tearfulness, overwhelm) in the first ~2 weeks are
          very common and usually pass on their own. Feeling low, anxious, or
          numb for longer than that — in either parent — is worth mentioning
          to a health visitor or GP. It&apos;s common, treatable, and not a
          reflection of you as a parent.
        </p>
      </div>
    </>
  );
}
