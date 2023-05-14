import { _decorator, Component, EventMouse, Input, input, Node, SkeletalAnimation, Vec3 } from 'cc';
import { Animation } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property({ type: SkeletalAnimation })
    public BodyAnim: SkeletalAnimation | null = null;

    //是否接收到跳跃指令
    private _startJump: boolean = false;

    //跳跃步长
    private _jumpStep: number = 0;

    private _curPos: Vec3 = new Vec3();

    private _targetPos: Vec3 = new Vec3();

    private _curJumpTime: number;

    private _curJumpSpeed: number;

    private _deltaPos: Vec3 = new Vec3();

    public curMoveIndex: number = 0;

    //跳跃间隔时间
    public JumpTime: number = 0.5;

    //一般初始化的代码都放在start中，
    //以确保start函数执行完毕后组件能正确地完成指定的初始化
    start() {

    }

    public setIsActive(active: boolean) {
        if (active == true) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
        else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    update(deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this.JumpTime) {
                //跳跃结束
                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.onOnceJumpEnd();
            }
            else {
                //跳跃中
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() == 0) {
            this.jumpByStep(1);
        }
        else if (event.getButton() == 2) {
            this.jumpByStep(2);
        }
    }

    jumpByStep(step: number) {
        if (this._startJump) {
            return;
        }
        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep / this.JumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));

        // var state = this.BodyAnim.getState("cocos_anim_jump");
        // state.speed = state.duration / this.JumpTime;
        // state.play();

        this.BodyAnim.getState('cocos_anim_jump').speed = 3.5; //跳跃动画时间比较长，这里加速播放
        this.BodyAnim.play('cocos_anim_jump'); //播放跳跃动画

        //胶囊体时期的动画
        // if (this.BodyAnim) {
        //     if (step == 1) {
        //         this.BodyAnim.play("OneStep");
        //     }
        //     else if (step == 2) {
        //         this.BodyAnim.play("TowStep");
        //     }
        // }

        this.curMoveIndex += step;
    }

    onOnceJumpEnd() {
        this.node.emit("JumpEndEvent", this.curMoveIndex);
        this.BodyAnim.play("cocos_anim_idle");
    }

    reset() {
        this.curMoveIndex = 0;
    }
}


