export interface EnumOption {
  id: string;
  description: string;
}

export interface LLMModelParameter {
  name: string;
  type: string;
  description: string;
  default: string;
  enum: EnumOption[];
  required: boolean;
}
