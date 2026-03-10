import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { renderApp } from "./App";
import { Root } from "react-dom/client";

export class MovimientoMaterial
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private container!: HTMLDivElement;
  private root!: Root;
  private notifyOutputChanged!: () => void;
  private outputJSON = "";
  

  init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.container = container;
    this.container.style.overflow = "hidden";
    this.notifyOutputChanged = notifyOutputChanged;
    this.root = renderApp(this.container, this.buildProps(context), null);
  }

  updateView(context: ComponentFramework.Context<IInputs>): void {
    this.root = renderApp(this.container, this.buildProps(context), this.root);
  }

  private buildProps(context: ComponentFramework.Context<IInputs>) {
    return {
      boletasJSON:       context.parameters.boletasJSON?.raw       ?? "",
      boletaJSON:        context.parameters.boletaJSON?.raw        ?? "",
      detallesJSON:      context.parameters.detallesJSON?.raw      ?? "",
      colaboradoresJSON: context.parameters.colaboradoresJSON?.raw ?? "",
      w: context.mode.allocatedWidth,
      h: context.mode.allocatedHeight,
      onOutput: (json: string) => {
        this.outputJSON = json;
        this.notifyOutputChanged();
      }
    };
  }

  getOutputs(): IOutputs {
    return { outputJSON: this.outputJSON };
  }

  destroy(): void {
    this.root?.unmount();
  }
}
