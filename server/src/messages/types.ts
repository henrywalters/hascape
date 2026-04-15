export enum APIMessages {
    LoggedIn,
    LoginFailed,
    LoggedOut,
    PlayerReceiveMessage,
    NPCsCleared,
    NPCSpawned,
    AddedItemToInventory,
    RemovedItemFromInventory,
    MovedItemInInventory,
    MapChange,
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