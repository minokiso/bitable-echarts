import { useCallback, useEffect, useState } from "react";
import "./App.css";
import EChartsComponent from "./echarts";
import { DatasetForm, datasetFormSubmit } from "./forms/dataset-form";
import { bitable } from "@lark-base-open/js-sdk";
import { Spin } from "antd";
import Navigation from "./navigation";
import { ViewForm, viewFormSubmit } from "./forms/view-form";
import { ThreeDForm, threeDFormSubmit } from "./forms/three-d-form";

// import './i18n'; // 取消注释以启用国际化
export function getSelection() {
	return bitable.base.getSelection();
}

export function getActiveTable() {
	return bitable.base.getActiveTable();
}

export default function App() {
	let [option, setOption] = useState({});
	let [loading, setLoading] = useState(false);
	let [navi, setNavi] = useState("three");
	const formSubmit = useCallback(
		async (formData: any) => {
			setLoading(true);
			try {
				await formMap[navi].formSubmit(formData, setOption);
			} catch (error) {
				console.log(error);
			}
			setLoading(false);
		},
		[navi]
	);

	const formMap: any = {
		three: {
			component: <ThreeDForm onSubmit={formSubmit} bitable={bitable}></ThreeDForm>,
			formSubmit: threeDFormSubmit,
		},
		view: {
			component: <ViewForm onSubmit={formSubmit} bitable={bitable}></ViewForm>,
			formSubmit: viewFormSubmit,
		},
		dataset: {
			component: <DatasetForm onSubmit={formSubmit} bitable={bitable}></DatasetForm>,
			formSubmit: datasetFormSubmit,
		},
	};

	return (
		<>
			<Navigation onNaviChange={setNavi} current={navi}></Navigation>
			<Spin spinning={loading}>
				{formMap[navi].component}
				<EChartsComponent option={option}></EChartsComponent>
			</Spin>
		</>
	);
}
