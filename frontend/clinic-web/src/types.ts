export type Staff = {
  id: number;
  nom: string;
  prenom: string;
  role: "Medecin" | "Infirmier" | "Secretaire" | string;
  email: string;
};
