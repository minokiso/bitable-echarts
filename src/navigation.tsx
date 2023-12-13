import { AppstoreOutlined, FundViewOutlined, HeatMapOutlined, MailOutlined, QuestionCircleOutlined, TableOutlined } from "@ant-design/icons";
import { Menu, MenuProps } from "antd";

export const naviItems: any = [
	{
		label: "3D 模式",
		key: "three",
		icon: <FundViewOutlined />,
	},
	{
		label: "2D 模式",
		key: "view",
		icon: <FundViewOutlined />,
	},
	{
		label: "热力图模式",
		key: "heat",
		icon: <HeatMapOutlined />,
	},
	{
		label: "帮助文档",
		key: "help",
		icon: <QuestionCircleOutlined />,
	},
];

export default function Navigation({ onNaviChange, current }: { onNaviChange: Function; current: string }) {
	const onClick: MenuProps["onClick"] = e => {
		e.key !== "help" ? onNaviChange(e.key) : window.open("https://smuport.feishu.cn/docx/VbuhdiyFwo4PZyxqCuycGipsnYd?from=from_copylinkwww.baidu.com");
	};

	return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={naviItems} />;
}
