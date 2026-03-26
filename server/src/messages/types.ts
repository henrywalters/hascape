export enum APIMessages {
    LoggedIn,
    LoggedOut,
    PlayerReceiveMessage,
    NPCsCleared,
    NPCSpawned,
    AddedItemToInventory,
    RemovedItemFromInventory,
    MovedItemInInventory,
}

export enum ServerMessages {
    Login,
    Logout,
    PlayerSetPosition,
    PlayerSendMessage,
    PlayerChangeHealth,
    NPCsClear,
    NPCSpawn,
    NPCMove,
    NPCChangeHealth,
    AddItemToInventory,
    RemoveItemFromInventory,
    MoveItemInInventory,
}