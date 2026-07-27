import { TimelineClip } from '../core/TimelineClip';
import { TextProperties } from '../types/timeline';

export class TextClip extends TimelineClip {
  public isTextClip = true;
  public override type: 'text' = 'text';

  public constructor() {
    super();
    this.mediaType = 'text';
    this.textProps = {
      content: 'Teks Baru',
      fontFamily: 'Inter',
      fontSize: 48,
      color: '#ffffff',
      backgroundColor: 'transparent',
      strokeColor: '#000000',
      strokeWidth: 0,
      align: 'center',
      bold: true,
      italic: false,
      animationStyle: 'none',
    };
  }

  public setTextContent(content: string): this {
    if (this.textProps) {
      this.textProps.content = content;
      this.dispatchEvent({ type: 'textChanged', content });
    }
    return this;
  }

  public setFont(fontFamily: string, fontSize: number): this {
    if (this.textProps) {
      this.textProps.fontFamily = fontFamily;
      this.textProps.fontSize = fontSize;
      this.dispatchEvent({ type: 'fontChanged', fontFamily, fontSize });
    }
    return this;
  }

  public override copy(source: TextClip, recursive = false): this {
    super.copy(source, recursive);
    return this;
  }
}
