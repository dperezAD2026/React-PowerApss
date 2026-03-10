import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { renderApp } from "./App";
import { Root } from "react-dom/client";

export class AvanceObra
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private container!: HTMLDivElement;
  private root!: Root;

  init(
    context: ComponentFramework.Context<IInputs>,
    _notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.container = container;
    this.container.style.position = "relative";
    this.container.style.overflow = "hidden";
    this.container.style.width    = "100%";
    this.container.style.height   = "100%";
    this.root = renderApp(container, { ctx: context }, null);
  }

  updateView(context: ComponentFramework.Context<IInputs>): void {
    const w = context.mode.allocatedWidth  > 0 ? context.mode.allocatedWidth  : undefined;
    const h = context.mode.allocatedHeight > 0 ? context.mode.allocatedHeight : undefined;
    this.root = renderApp(this.container, { ctx: context, w, h }, this.root);
  }

  getOutputs(): IOutputs {
    return {};
  }

  destroy(): void {
    this.root.unmount();
  }
}


