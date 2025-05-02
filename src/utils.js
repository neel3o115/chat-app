export const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 8);
};

export const getPrivateRoomId = (user1, user2) => {
  return ['private', ...[user1, user2].sort()].join("-");
};
