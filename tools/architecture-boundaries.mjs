export function architectureConstraints(config) {
  if (config.version !== 1 || !config.capabilities?.[config.appScope]) {
    throw new Error('Invalid architecture.config.json');
  }
  const scopes = Object.keys(config.capabilities);
  return scopes.map((scope) => ({
    sourceTag: `scope:${scope}`,
    onlyDependOnLibsWithTags: (scope === config.appScope
      ? scopes
      : [scope, ...(config.capabilities[scope].dependsOn ?? [])]
    )
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort()
      .map((value) => `scope:${value}`),
  }));
}

export const typeConstraints = [
  {
    sourceTag: 'type:app',
    onlyDependOnLibsWithTags: [
      'type:feature',
      'type:data-access',
      'type:ui',
      'type:domain',
      'type:util',
    ],
  },
  {
    sourceTag: 'type:feature',
    onlyDependOnLibsWithTags: [
      'type:feature',
      'type:data-access',
      'type:ui',
      'type:domain',
      'type:util',
    ],
  },
  {
    sourceTag: 'type:data-access',
    onlyDependOnLibsWithTags: ['type:data-access', 'type:domain', 'type:util'],
  },
  {
    sourceTag: 'type:domain',
    onlyDependOnLibsWithTags: ['type:domain', 'type:util'],
  },
  {
    sourceTag: 'type:ui',
    onlyDependOnLibsWithTags: ['type:ui', 'type:domain', 'type:util'],
  },
  { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] },
];
