// capacitor.config.ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mychurchlab.app",
  appName: "MyChurch",
  webDir: "out",
  server: {
    androidScheme: "https" // opcional, ajuda com cookies
    // NÃO defina 'url' aqui para build embarcado
  },
};

export default config;
