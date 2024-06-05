const customDomain = process.env.CUSTOM_DOMAIN;
const production = customDomain;
const dev = `dev.${customDomain}`;

export const domain = !!customDomain
  ? { production, dev }[$app.stage] || `${$app.stage}.${dev}`
  : undefined;
