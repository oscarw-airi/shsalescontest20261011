# NeoDerm 双月冲刺 v13

## 数据源
Google Sheet ID: `13bEDi4qQHvfYnOBOQiYgD4HSxlNAK6YWWrAkCkkikOQ`
GID: `0`

固定映射：
- A = Center
- B = Individual
- C = Target
- D = Actual Sales（当前个人累计实际业绩）

Total / Grand Total 行会被完全忽略。

## 进化逻辑
- Diamond = 1 × Target
- Gold = 2 × Target
- Crown = 3 × Target
- 例如 25 万 Target：25万钻石 → 50万黄金 → 75万皇冠
- 跑道显示金额，不显示 100% / 120% / 150%。
- Evolution Garage 必须先选择治疗师，不再默认显示业绩最高的人。
- 治疗师姓名固定在移动中的猫咪旁边一起跑。

## GitHub Pages
上传整个项目后，在 Settings → Pages → Deploy from main branch。


## Updated cat evolution artwork
The cat evolution artwork has been replaced with the newly supplied 2×2 transparent sprite sheet:
- Top-left = Start / coin
- Top-right = Diamond
- Bottom-left = Gold
- Bottom-right = Crown

The race track and Evolution Garage both use this same artwork.
