// Type-safe navigation types for Saufee app

export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)/login': undefined;
  '(auth)/signup': undefined;
  'routine/[id]': { id: string };
  paywall: { highlightedPlan?: 'monthly' | 'annual'; fromFeature?: string };
  onboarding?: undefined;
};

export type TabParamList = {
  index: undefined;
  routines: undefined;
  templates: undefined;
  analytics: undefined;
  settings: undefined;
};

export type DeepLinkRoutes = {
  paywall: undefined;
  'routine/:id': { id: string };
  restore: undefined;
  premium: undefined;
};
