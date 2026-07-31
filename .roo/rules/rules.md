## 开发规范
1. **代码风格**：
   - 遵循 ESLint 和 Prettier 规则，确保代码一致性。
   - 使用语义化的变量和函数命名。

2. **组件设计**：
   - 遵循单一职责原则，每个组件只负责一个功能。

3. **版本控制**：
   - 使用 Git 进行版本管理。
   - 遵循 Git 分支管理规范，例如 Git Flow 或 Feature Branch 模型。

4. **测试**：
   - 编写单元测试（使用 Vitest）。
   - 编写端到端测试（使用 Cypress）。

5. **文档**：
   - 在代码中添加必要的注释。
   - 使用 README 文件记录项目的安装、使用和开发指南。

6. **性能优化**：
   - 使用懒加载和代码分割优化前端性能。
   - 确保 IndexedDB 操作的高效性，避免阻塞主线程。
  
7. **附加说明**：
   - Use TypeScript for type safety
   - Implement proper props and emits definitions
   - Utilize Vue 3's Teleport component when needed
   - Use Suspense for async components
   - Implement proper error handling
   - Follow Vue 3 style guide and naming conventions
   - Use Vite for fast development and building