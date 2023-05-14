import { _decorator, Component, instantiate, Label, Node, Prefab, Vec3 } from 'cc';
import { E_BlockType } from './Enum/E_BlockType';
import { E_GameState } from './Enum/E_GameState';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: Prefab })
    public CubePrfb: Prefab;

    @property
    public RoadLength = 50;
    private _road: E_BlockType[] = [];

    private _curGameState: E_GameState | null = null;

    set CurGameState(value: E_GameState) {
        this._curGameState = value;
        switch (value) {
            case E_GameState.GS_INIT:
                this.init();
                this.PlayerCtrl?.reset();
                if (this.StepLabel) {
                    this.StepLabel.string = "0";
                }
                break;
            case E_GameState.GS_RUN:
                this.run();
                break;
            case E_GameState.GS_OVER:
                this.over();
                break;
        }
    }
    get CurGameState() {
        return this._curGameState;
    }

    @property({ type: PlayerController })
    public PlayerCtrl: PlayerController | null = null;

    @property({ group: { name: 'Menu' }, type: Node })
    public StartMenu: Node | null = null;

    @property({ type: Label })
    public StepLabel: Label | null = null;

    @property({ group: { name: 'Menu' }, type: Node })
    public EndMenu: Node | null = null;

    @property({ group: { name: 'UI' }, type: Label })
    public Score: Label | null = null;

    private _score: number = 0;


    start() {
        this.CurGameState = E_GameState.GS_INIT;
        this.PlayerCtrl?.node.on("JumpEndEvent", this.checkJumpResult, this);
    }

    init() {
        if (this.EndMenu && this.EndMenu.active == true) {
            this.EndMenu.active = false;
        }
        if (this.StartMenu && this.StartMenu.active == false) {
            this.StartMenu.active = true;
        }
        this.generateRoad();
        if (this.PlayerCtrl) {
            this.PlayerCtrl.setIsActive(false);
            this.PlayerCtrl.node.setPosition(Vec3.ZERO);
        }
    }

    run() {
        if (this.StartMenu) {
            this.StartMenu.active = false;
        }
        //在点击开始按钮然后抬起鼠标后，会先执行逻辑，此时鼠标抬起事件还未派发，若此时直接添加鼠标监听
        //游戏一开始，人物就会移动了
        // if (this.PlayerCtrl) {
        //     this.PlayerCtrl.setIsActive(true);
        // }
        setTimeout(() => {
            if (this.PlayerCtrl) {
                this.PlayerCtrl.setIsActive(true);
            }
        }, 0.1);
    }

    over() {
        this.PlayerCtrl?.setIsActive(false);
        if (this.EndMenu && this.EndMenu.active == false) {
            this.Score.string = this.StepLabel.string;
            this.EndMenu.active = true;
        }
    }

    generateRoad() {
        this.node.removeAllChildren();
        this._road = null;
        this._road = [];
        //第一个必须是地板
        this._road.push(E_BlockType.BT_STONE);
        for (let i = 1; i < this.RoadLength; i++) {
            if (this._road[i - 1] == E_BlockType.BT_NONE) {
                this._road.push(E_BlockType.BT_STONE);
            }
            else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }

        for (let i = 0; i < this._road.length; i++) {
            let block: Node | null = null;
            block = this.spawnBlock(this._road[i]);
            if (block) {
                this.node.addChild(block);
                block.setPosition(i, -1.5, 0);
            }
        }
    }

    spawnBlock(type: E_BlockType): Node {
        if (!this.CubePrfb) return null;
        let block: Node | null = null;
        switch (type) {
            case E_BlockType.BT_NONE:
                break;
            case E_BlockType.BT_STONE:
                block = instantiate(this.CubePrfb);
        }
        return block;
    }

    update(deltaTime: number) {

    }


    onStartButtonClicked() {
        this.CurGameState = E_GameState.GS_RUN;
    }

    onReStartButtonClicked() {
        this.CurGameState = E_GameState.GS_INIT;
    }

    checkJumpResult(moveIndex: number) {
        if (moveIndex < this._road.length) {
            if (this._road[moveIndex] == E_BlockType.BT_NONE) {
                this.CurGameState = E_GameState.GS_OVER;
            }
            else {
                if (this.StepLabel) {
                    this.StepLabel.string = moveIndex > this._road.length ? this._road.length.toString() : moveIndex.toString();
                }
            }
        }
        else {
            this.CurGameState = E_GameState.GS_OVER;
        }
    }
}


