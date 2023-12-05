import { useCallback, useEffect, useState } from "react";
import "./App.css";
import EChartsComponent from "./echarts";
import { DatasetForm, datasetFormSubmit } from "./dataset-form";
import { bitable } from "@lark-base-open/js-sdk";
import { Spin } from "antd";
import Navigation from "./navigation";
import { ViewForm, viewFormSubmit } from "./view-form";

// import './i18n'; // 取消注释以启用国际化

export default function App() {
	let [option, setOption] = useState({});
	let [loading, setLoading] = useState(false);
	let [navi, setNavi] = useState("view");

	const formSubmit = useCallback(async (formData: any) => {
		setLoading(true);
		try {
			await viewFormSubmit(formData, setOption);
			// navi === "view" ? viewFormSubmit(formData, setOption) : datasetFormSubmit(formData, setOption);
		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	}, []);

	return (
		<>
			<Navigation onNaviChange={setNavi}></Navigation>
			<Spin spinning={loading}>
				{navi === "view" ? <ViewForm onSubmit={formSubmit} bitable={bitable}></ViewForm> : <DatasetForm onSubmit={formSubmit} bitable={bitable}></DatasetForm>}
				<EChartsComponent option={option}></EChartsComponent>
			</Spin>
		</>
	);
}
