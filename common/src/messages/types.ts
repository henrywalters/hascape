export enum ClientMessages {
    Connect,
    PlayerMove,
    PlayerMessage,
    CharacterAttack,
    PickupItem,
    CharacterInteract,
    CharacterAction,
}

export enum ServerMessages {
    PlayerJoined,
    OtherPlayerJoined,
    PlayerLeft,
    PlayerMoved,
    PlayerMessaged,
    MovementUpdate,
    NPCJoined,
    CharacterAttacked,
    CharacterChangeHealth,
    CharacterDied,
    ItemsSpawned,
    ItemsDespawned,
    PickedUpItem,
    DroppedItem,
    ActionReceived,
}