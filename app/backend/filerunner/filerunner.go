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

package filerunner

import (
	"errors"
	"os/exec"
	"path/filepath"
	"runtime"
	"syscall"
)

func Run(filePath string, options ...func(cmd *exec.Cmd)) error {
	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "windows":
		// For Windows, use cmd.exe to execute the script
		{
			cmd = exec.Command("cmd", "/c", "chcp ", "65001 ")
			cmd.SysProcAttr = &syscall.SysProcAttr{
				HideWindow: true,
			}
			_ = cmd.Run()

			cmd = exec.Command("cmd", "/c", filePath)
			cmd.SysProcAttr = &syscall.SysProcAttr{
				HideWindow: true,
			}
		}
	case "linux", "darwin":
		// For Linux and macOS, use sh to execute the script
		cmd = exec.Command("sh", filePath)
	default:
		return errors.New("unsupported os")
	}

	dir := filepath.Dir(filePath)
	cmd.Dir = dir

	for _, option := range options {
		option(cmd)
	}

	return cmd.Run()
}

func StdOut() {

}
