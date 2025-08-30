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

package application

import (
	index "app/backend/domain/index/service"
	script "app/backend/domain/script/service"
	"app/backend/infra/db"
	"go.uber.org/dig"
)

func Init(container *dig.Container) {

	// 声明组件
	{
		// 基础设施
		_ = container.Provide(db.NewDb)

	}
	// 服务
	{
		_ = container.Provide(script.NewScriptService)
		_ = container.Provide(index.NewIndexService)
	}

}
