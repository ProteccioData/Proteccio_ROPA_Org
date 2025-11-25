export const hasPermission = (permissions, module, action) => {
  if (!permissions || !permissions[module]) return false;
  return permissions[module].includes(action);
};
