export interface Experiment {
  id: string
  name: string
  type: 'pricing' | 'feature' | 'ui'
  status: 'draft' | 'active' | 'paused' | 'completed'
  variants: ExperimentVariant[]
  traffic_allocation: number
  start_date: string
  end_date?: string
  success_metric: string
  target_sample_size: number
  metadata: Record<string, any>
}

export interface ExperimentVariant {
  id: string
  name: string
  traffic_percentage: number
  config: Record<string, any>
  is_control: boolean
}

export interface ExperimentAssignment {
  user_id: string
  experiment_id: string
  variant_id: string
  assigned_at: string
  converted: boolean
  conversion_value?: number
}

export class ExperimentManager {
  // Disabled implementation - no database connection needed

  // All methods disabled until database tables are created
  async getActiveExperiments(): Promise<Experiment[]> {
    console.log('Getting active experiments (mock)');
    return [];
  }

  async getUserAssignment(experimentId: string, userId: string): Promise<ExperimentVariant | null> {
    console.log('Getting user assignment (mock):', { experimentId, userId });
    return null;
  }

  async assignUserToExperiment(experimentId: string, userId: string): Promise<ExperimentVariant | null> {
    console.log('Assigning user to experiment (mock):', { experimentId, userId });
    return null;
  }

  async trackConversion(experimentId: string, userId: string, value?: number): Promise<void> {
    console.log('Tracking conversion (mock):', { experimentId, userId, value });
  }

  async getExperimentResults(experimentId: string): Promise<{
    variants: Array<{
      variant_id: string
      name: string
      users: number
      conversions: number
      conversion_rate: number
      average_value: number
    }>
    statistical_significance: boolean
  }> {
    console.log('Getting experiment results (mock):', experimentId);
    return {
      variants: [],
      statistical_significance: false
    };
  }

  async createExperiment(experiment: Omit<Experiment, 'id'>): Promise<string> {
    console.log('Creating experiment (mock):', experiment.name);
    return 'mock-experiment-id';
  }

  async startExperiment(experimentId: string): Promise<void> {
    console.log('Starting experiment (mock):', experimentId);
  }

  async stopExperiment(experimentId: string): Promise<void> {
    console.log('Stopping experiment (mock):', experimentId);
  }

  async archiveExperiment(experimentId: string): Promise<void> {
    console.log('Archiving experiment (mock):', experimentId);
  }

  async getVariant(experimentId: string, userId?: string): Promise<ExperimentVariant | null> {
    console.log('Getting variant (mock):', { experimentId, userId });
    return null;
  }
  async getVariantData(experimentId: string, variant: string | ExperimentVariant | null): Promise<Record<string, any>> {
    console.log('Getting variant data (mock):', { experimentId, variant });
    return {};
  }

  private selectVariant(variants: ExperimentVariant[], userId: string): ExperimentVariant | null {
    console.log('Selecting variant (mock):', { variants: variants.length, userId });
    return variants[0] || null;
  }
}

export const experimentManager = new ExperimentManager()
