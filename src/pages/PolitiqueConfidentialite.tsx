import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const sections = [
  {
    title: "1. Données collectées",
    content: `Nous collectons uniquement les données personnelles que vous nous fournissez volontairement via nos formulaires :

• Nom et prénom
• Adresse e-mail
• Numéro de téléphone
• Messages ou remarques éventuelles

Nous ne collectons pas de données de navigation, de cookies tiers, ni d'informations sensibles.`,
  },
  {
    title: "2. Finalité du traitement",
    content: `Vos données sont utilisées exclusivement pour :

• Gérer vos réservations de produits en magasin
• Confirmer vos inscriptions à nos événements (Test Days, essais)
• Répondre à vos demandes de contact
• Vous envoyer des communications relatives à nos offres, événements et actualités (uniquement avec votre consentement explicite)
• Assurer la gestion administrative des commandes et réservations`,
  },
  {
    title: "3. Stockage et sécurité",
    content: `Vos données sont hébergées de manière sécurisée sur les serveurs de Supabase, dont les infrastructures sont situées dans l'Union Européenne. Supabase est certifié conforme au RGPD et applique des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation.

Nous conservons vos données uniquement le temps nécessaire à la finalité pour laquelle elles ont été collectées.`,
  },
  {
    title: "4. Vos droits",
    content: `Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679) et à la loi belge du 30 juillet 2018, vous disposez des droits suivants :

• Droit d'accès : obtenir une copie de vos données personnelles
• Droit de rectification : corriger des données inexactes ou incomplètes
• Droit à l'effacement (droit à l'oubli) : demander la suppression de vos données
• Droit d'opposition : vous opposer au traitement de vos données à des fins de marketing
• Droit à la portabilité : recevoir vos données dans un format structuré

Pour exercer ces droits, contactez-nous à : admindesmetequipement@gmail.com

Vous pouvez également introduire une réclamation auprès de l'Autorité de Protection des Données (APD) : www.autoriteprotectiondonnees.be`,
  },
  {
    title: "5. Pas de revente de données",
    content: `Desmet Équipement s'engage formellement à ne jamais vendre, louer ou partager vos données personnelles avec des tiers à des fins commerciales ou publicitaires. Vos données restent strictement confidentielles et ne sont utilisées qu'à des fins internes liées à la relation commerciale et au service client.`,
  },
  {
    title: "6. Base légale",
    content: `La présente politique de confidentialité est régie par le droit belge et par le Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679 du Parlement européen et du Conseil du 27 avril 2016).

Le traitement de vos données repose sur votre consentement explicite (formulaires de réservation et d'inscription aux événements) et sur notre intérêt légitime à répondre à vos demandes de contact.`,
  },
];

export default function PolitiqueConfidentialitePage() {
  return (
    <Layout>
      <SEO
        title="Politique de Confidentialité — Desmet Équipement"
        description="Politique de confidentialité de Desmet Équipement. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD."
      />
      <section className="min-h-screen bg-[#0e0e0e] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">

            {/* Back */}
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/35 transition-colors hover:text-[#c9973a]"
            >
              ← Retour à l'accueil
            </Link>

            {/* Header */}
            <p className="mb-2 font-display text-xs uppercase tracking-[0.3em] text-[#c9973a]">
              DESMET ÉQUIPEMENT
            </p>
            <h1 className="mb-3 font-display text-4xl uppercase leading-tight tracking-widest text-white sm:text-5xl">
              POLITIQUE DE<br />CONFIDENTIALITÉ
            </h1>
            <p className="mb-12 text-sm text-white/35 uppercase tracking-widest">
              Dernière mise à jour&nbsp;: 31 mars 2026
            </p>

            {/* Intro */}
            <div className="mb-10 border-l-2 border-[#c9973a]/40 pl-5">
              <p className="text-sm leading-relaxed text-white/60">
                Desmet Équipement attache une importance particulière à la protection de vos données personnelles.
                La présente politique décrit les informations que nous collectons, la façon dont nous les utilisons
                et les droits dont vous disposez conformément au RGPD.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((s) => (
                <div key={s.title} className="border border-[#c9973a]/12 bg-[#111] p-6">
                  <h2 className="mb-4 font-display text-lg uppercase tracking-[0.18em] text-[#c9973a]">
                    {s.title}
                  </h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-white/60">
                    {s.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Contact block */}
            <div className="mt-10 border border-[#c9973a]/25 bg-[#c9973a]/5 p-6">
              <p className="mb-1 font-display text-xs uppercase tracking-[0.25em] text-[#c9973a]">
                CONTACT — PROTECTION DES DONNÉES
              </p>
              <p className="text-sm text-white/60">
                Pour toute question relative à vos données personnelles&nbsp;:
              </p>
              <a
                href="mailto:admindesmetequipement@gmail.com"
                className="mt-2 block text-sm text-[#c9973a] transition-opacity hover:opacity-75"
              >
                admindesmetequipement@gmail.com
              </a>
              <p className="mt-3 text-xs text-white/35">
                Desmet Équipement — Chaussée de Louvain 491, 1300 Wavre, Belgique
              </p>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
