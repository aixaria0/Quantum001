import type { ComponentType } from "react";
import { AdvantageLab } from "@/components/labs/advantage";
import { AnnealingLab } from "@/components/labs/annealing";
import { AtlasLab } from "@/components/labs/atlas";
import { EvolutionLab } from "@/components/labs/evolution";
import { GroverLab } from "@/components/labs/grover";
import { KnittingLab } from "@/components/labs/knitting";
import { MesolveLab } from "@/components/labs/mesolve";
import { QaoaLab } from "@/components/labs/qaoa";
import { QbmLab } from "@/components/labs/qbm";
import { QecLab } from "@/components/labs/qec";
import { QmlLab } from "@/components/labs/qml";
import { ShorLab } from "@/components/labs/shor";

export const LAB_VIEWS: Record<string, ComponentType> = {
  evolution: EvolutionLab,
  shor: ShorLab,
  grover: GroverLab,
  qaoa: QaoaLab,
  knitting: KnittingLab,
  annealing: AnnealingLab,
  qec: QecLab,
  advantage: AdvantageLab,
  qml: QmlLab,
  qbm: QbmLab,
  mesolve: MesolveLab,
  atlas: AtlasLab,
};
