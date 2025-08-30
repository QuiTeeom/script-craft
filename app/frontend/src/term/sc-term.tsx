/*
 *
 *  * Copyright 2025 QuiTeeom <quiteeom@gmail.com>.
 *  * Author Github: https://github.com/QuiTeeom
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     https://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */


import styled from "styled-components";
import React, {useEffect, useRef} from "react";
import {Terminal} from "@xterm/xterm";
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css'

export interface Writer {
    write(data:Uint8Array) : void
}

const TermWrapper = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
`

export function ScTerm(
    props:{
        writer:React.MutableRefObject<Writer|null>
    }
){

    const term:React.MutableRefObject<null|Terminal> = useRef(null)
    const writeController:React.MutableRefObject<null|WriteController> = useRef(null)
    const inputController:React.MutableRefObject<null|UserInputController> = useRef(null)
    const termWrapper:React.MutableRefObject<HTMLDivElement|null> = useRef(null);

    useEffect(() => {
        props.writer.current = new class implements Writer {
            write(data: Uint8Array): void {
                writeController.current?.write(data)
            }
        }
    }, []);

    useEffect(() => {
        if (term.current!=null){
            return;
        }
        if (termWrapper.current==null){
            return
        }
        const xterm = new Terminal({
            disableStdin: true,
            cursorInactiveStyle: "none",
        });
        const fitAddon = new FitAddon();
        xterm.loadAddon(fitAddon);
        xterm.open(termWrapper.current);

        setInterval(()=>{
            fitAddon.fit();
        },1000)

        writeController.current = new WriteController(xterm);
        inputController.current = new UserInputController(xterm,writeController.current)

        xterm.onData((data) => {
            inputController.current?.input(data)
        })

        term.current = xterm
    }, []);

    return (
        <TermWrapper ref={termWrapper} />
    )
}


const testEncoder = new TextEncoder();

class UserInputController {
    xterm:Terminal
    writeController: WriteController
    pre:string
    i:string
    constructor(x:Terminal,w:WriteController) {
        this.xterm = x
        this.writeController = w
        this.i = ''
        this.pre = ''
        this.xterm.write(this.pre)
    }

    public input(data:string){
        console.log(testEncoder.encode(data))
        if (data == '\x7F'){
            if (this.i.length>0){
                this.i = this.i.substring(0,this.i.length-1)
                this.writeController.write(testEncoder.encode('\b \b'))
            }
            return;
        }
        if (data=='\r'){
            if (this.i==='cls'){
                this.writeController.write(Uint8Array.of(13,10))
                this.xterm.clear()
                this.xterm.write(this.pre)
                this.i = ''
                return;
            }
            this.writeController.write(Uint8Array.of(13,10))
            this.xterm.write(this.pre)
            this.i = ''
            return
        }
        this.i+=data
        this.writeController.write(testEncoder.encode(data))
    }
}

class WriteController {
    xterm:Terminal

    constructor(x:Terminal) {
        this.xterm = x
    }

    public write(data: Uint8Array){
        const number = data.at(0)

        if (number==13){
            // \r
        }else
        if (number==10) {
            // \n
            this.xterm.write(Uint8Array.of(13,10))
            return;
        }else if (number==12) {
            // \f
            this.xterm.clear()
            this.xterm.write(Uint8Array.of(13))
            return
        }

        // console.log(data)
        this.xterm.write(data)
    }
}





