import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { renderApp } from "./App";
import { Root } from "react-dom/client";

export class Presupuesto
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private container!: HTMLDivElement;
  private root!: Root;

  init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.container = container;
    this.root = renderApp(container, "");
  }

  updateView(context: ComponentFramework.Context<IInputs>): void {
    const value = context.parameters.sampleProperty.raw ?? "";
    this.root = renderApp(this.container, value);
  }

  getOutputs(): IOutputs {
    return {};
  }

  destroy(): void {
    this.root.unmount();
  }
}
