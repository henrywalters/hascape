import { Repository } from "typeorm";
import { InventoryItem } from "../entity/inventory";
import { AppDataSource } from "../data-source";
import { User } from "../entity/user";
import { ITEMS } from "@hascape/common";
import { Random } from "hcore/dist/random";
import { Player } from "../entity/player";

export class InventoryService {
    
    private items: Repository<InventoryItem>;
    
    constructor() {
        this.items = AppDataSource.getRepository(InventoryItem);
    }

    public async getItems(player: Player) {
        return this.items.find({
            where: {
                player: {
                    id: player.id,
                }
            }
        });
    }

    public async getItem(player: Player, item: string) {
        return this.items.findOne({
            where: {
                item,
                player: {
                    id: player.id,
                }
            }
        })
    }

    public async addItem(player: Player, instanceId: string, item: string, quantity: number, position: number) {

        const newItem = new InventoryItem();
        newItem.instanceId = instanceId;
        newItem.item = item;
        newItem.player = player;
        newItem.quantity = quantity;
        newItem.position = position;

        await this.items.save(newItem);

        return newItem;
    }

    public async removeItem(player: Player, instanceId: string) {
        const item = await this.items.findOne({
            where: {
                instanceId,
                player: {
                    id: player.id,
                }
            }
        });
        if (item) {
            await this.items.remove(item);
        }
    }
}