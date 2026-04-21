import React from "react";
import { MapPin, CheckCircle, CornerUpRight } from "lucide-react";

interface Step {
  icon: React.JSX.Element;
  number: string;
  name: string;
  desc: string;
}

interface Card {
  title: string;
  desc: string;
}

const steps: Step[] = [
  {
    icon: <MapPin size={22} color="#FCA311" />,
    number: "1",
    name: "Detecta",
    desc: "Los usuarios reportan bloqueos desde su ubicacion GPS.",
  },
  {
    icon: <CheckCircle size={22} color="#FCA311" />,
    number: "2",
    name: "Verifica",
    desc: "La comunidad confirma o descarta reportes mediante votos.",
  },
  {
    icon: <CornerUpRight size={22} color="#FCA311" />,
    number: "3",
    name: "Redirige",
    desc: "El sistema calcula rutas alternativas evitando bloqueos.",
  },
];

const cards: Card[] = [
  {
    title: "Alertas en tiempo real",
    desc: "Recibe notificaciones sobre bloqueos, marchas y cierres viales cerca de tu ubicacion o tu ruta planificada",
  },
  {
    title: "Reportes colaborativos",
    desc: "La comunidad verifica cada reporte. Los bloqueos confirmados por multiples usuarios son mas confiables.",
  },
  {
    title: "Rutas inteligentes",
    desc: "Recibe notificaciones sobre bloqueos, marchas y cierres viales cerca de tu ubicacion o tu ruta planificada",
  },
  {
    title: "Comunidad activa",
    desc: "Recibe notificaciones sobre bloqueos, marchas y cierres viales cerca de tu ubicacion o tu ruta planificada",
  },
];

const HowItWorks = (): React.JSX.Element => {
  return (
    <section id="como-funciona" className="how-it-works">
      <p className="how-it-works__eyebrow">Como funciona?</p>
      <h2 className="how-it-works__title">
        Simple, rapido y <span>colaborativo</span>
      </h2>
      <div className="how-it-works__steps">
        {steps.map((step: Step) => (
          <div key={step.number} className="step">
            <div className="step__icon">{step.icon}</div>
            <p className="step__number">{step.number}</p>
            <p className="step__name">{step.name}</p>
            <p className="step__desc">{step.desc}</p>
          </div>
        ))}
      </div>
      <div className="how-it-works__cards">
        {cards.map((card: Card, i: number) => (
          <div key={i} className="feature-card">
            <p className="feature-card__title">{card.title}</p>
            <p className="feature-card__desc">{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;