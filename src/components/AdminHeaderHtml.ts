
/**
 * Utilitaire: génère le HTML à injecter pour en-tête admin
 * Usage: import { getAdminHeaderHtml } from "./AdminHeaderHtml"
 * Ajout: optionnellement, permet d’inclure un bloc à droite (ex : numéro de facture)
 */
export function getAdminHeaderHtml(options?: { right?: string }) {
  const defaultData = {
    nom: "L’île des Bambins",
    sousTitre: "Crèche et préscolaire",
    adresse: "1000 logt IHEDDADEN BEJAIA",
    telephone: "0553367356 / 034 11 98 27",
    email: "liledesbambins@gmail.com",
    cb: "",
    nif: "196506010063735",
    article: "06017732933",
    rc: "06/01-0961315A10",
    nis: "",
    logo: ""
  };
  let admin = defaultData;
  try {
    const stored = localStorage.getItem("admin_profile");
    if (stored) {
      admin = { ...defaultData, ...JSON.parse(stored) };
    }
  } catch {}

  // Ajout du bloc à droite si fourni (ex : numéro de facture)
  const rightBloc =
    options?.right
      ? `<div style="
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            flex-shrink: 0;
            margin-left: 18px;
            min-width: 105px;
            justify-content: flex-start;
          ">
            <span style="
              font-weight: 700;
              font-size: 1.09em;
              color: #1852a1;
              letter-spacing: 0.7px;
              margin-top: 4px;
              white-space: nowrap;
            ">${options.right}</span>
          </div>`
      : "";

  // Afficher le sous-titre sous le nom
  return `
    <div style="
      width:100%;
      box-sizing:border-box;
      margin-bottom:22px;
      font-family:'Segoe UI',Arial,'Helvetica Neue',sans-serif;
      border-bottom:1.5px solid #e5e7eb;
      padding-bottom:18px;
    ">
      <div style="display:flex;align-items:flex-start;">
        ${
          admin.logo
            ? `<div style="flex-shrink:0;margin-right:26px">
                  <img src="${admin.logo}" alt="logo" style="width:66px;height:66px;border-radius:12px;object-fit:cover;border:2px solid #173583;background:#f5f8ff;box-shadow:0 2px 8px rgba(22,50,100,0.10);" />
                </div>`
            : ""
        }
        <div style="flex:1;">
          <div style="font-size:1.55em;font-weight:700;color:#1852a1;line-height:1;margin-bottom:3px;letter-spacing:0.1px;">
            ${admin.nom}
          </div>
          <div style="font-style:italic;color:#2e4a70;font-size:1.06em;line-height:1.2;margin-bottom:9px;">
            ${admin.sousTitre || ""}
          </div>
          <div style="margin-bottom:7px;color:#222;font-size:1em;line-height:1.56;">
            <b>Adresse :</b> ${admin.adresse || ""}
          </div>
          <div style="margin-bottom:7px;color:#222;font-size:1em;line-height:1.56;">
            <b>Tél :</b> ${admin.telephone || ""}
          </div>
          <div style="margin-bottom:7px;color:#222;font-size:1em;line-height:1.56;">
            <b>Email :</b> ${admin.email || ""}
          </div>
          ${admin.cb ? `
            <div style="margin-bottom:7px;color:#222;font-size:1em;line-height:1.56;">
              <b>C.B BNA :</b> ${admin.cb}
            </div>
          ` : ""}
          <div style="margin-bottom:7px;color:#222;font-size:1em;line-height:1.56;">
            <b>NIF :</b> ${admin.nif || ""}
          </div>
          <div style="margin-bottom:7px;color:#222;font-size:1em;line-height:1.56;">
            <b>N° Article :</b> ${admin.article || ""}
          </div>
          <div style="margin-bottom:7px;color:#222;font-size:1em;line-height:1.56;">
            <b>RC :</b> ${admin.rc || ""}
          </div>
          ${admin.nis ? `
            <div style="margin-bottom:7px;color:#222;font-size:1em;line-height:1.56;">
              <b>NIS :</b> ${admin.nis}
            </div>
          ` : ""}
        </div>
        ${rightBloc}
      </div>
    </div>
  `;
}

