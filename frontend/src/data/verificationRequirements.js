export const verificationRequirements = {
  buyer: {
    identity: ['Government ID (front + back) or Passport', 'Selfie / live photo'],
  },
  owner: {
    identity: ['Government ID (front + back) or Passport', 'Selfie / live photo'],
    role: ['Ownership proof (sale deed / tax receipt / utility bill)', 'Optional: POA/authorization letter if not owner'],
  },
  agent: {
    identity: ['Government ID (front + back) or Passport', 'Selfie / live photo'],
    role: ['License / RERA certificate', 'Optional: company proof (GST/CIN)'],
  },
}

export const kindForRole = (role) => {
  if (role === 'owner') return ['identity', 'owner_role']
  if (role === 'agent' || role === 'broker') return ['identity', 'agent_role']
  return ['identity']
}
