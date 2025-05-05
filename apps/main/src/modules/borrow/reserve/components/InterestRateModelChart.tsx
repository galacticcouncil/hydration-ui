import { AreaChart } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const InterestRateModelChart = () => {
  const { t } = useTranslation()
  return (
    <AreaChart
      height={240}
      data={INTEREST_RATES}
      gradient="none"
      xAxisProps={{
        type: "number",
      }}
      config={{
        xAxisKey: "utilization",
        xAxisFormatter: (value) => t("percent", { value }),
        yAxisFormatter: (value) => t("percent", { value: value * 100 }),
        series: [
          {
            key: "variableRate",
            label: "Value",
            color: "#E53E76",
          },
        ],
      }}
    />
  )
}

const INTEREST_RATES = [
  {
    stableRate: 0,
    variableRate: 0,
    utilization: 0,
  },
  {
    stableRate: 0.050029411764705885,
    variableRate: 0.00023529411764705883,
    utilization: 0.5,
  },
  {
    stableRate: 0.05005882352941177,
    variableRate: 0.00047058823529411766,
    utilization: 1,
  },
  {
    stableRate: 0.05008823529411765,
    variableRate: 0.0007058823529411765,
    utilization: 1.5,
  },
  {
    stableRate: 0.05011764705882353,
    variableRate: 0.0009411764705882353,
    utilization: 2,
  },
  {
    stableRate: 0.05014705882352941,
    variableRate: 0.001176470588235294,
    utilization: 2.5,
  },
  {
    stableRate: 0.050176470588235295,
    variableRate: 0.001411764705882353,
    utilization: 3,
  },
  {
    stableRate: 0.05020588235294118,
    variableRate: 0.0016470588235294118,
    utilization: 3.5,
  },
  {
    stableRate: 0.05023529411764706,
    variableRate: 0.0018823529411764706,
    utilization: 4,
  },
  {
    stableRate: 0.05026470588235294,
    variableRate: 0.0021176470588235292,
    utilization: 4.5,
  },
  {
    stableRate: 0.05029411764705882,
    variableRate: 0.002352941176470588,
    utilization: 5,
  },
  {
    stableRate: 0.050323529411764704,
    variableRate: 0.0025882352941176473,
    utilization: 5.5,
  },
  {
    stableRate: 0.050352941176470586,
    variableRate: 0.002823529411764706,
    utilization: 6,
  },
  {
    stableRate: 0.05038235294117647,
    variableRate: 0.003058823529411765,
    utilization: 6.5,
  },
  {
    stableRate: 0.05041176470588235,
    variableRate: 0.0032941176470588237,
    utilization: 7,
  },
  {
    stableRate: 0.05044117647058823,
    variableRate: 0.0035294117647058825,
    utilization: 7.5,
  },
  {
    stableRate: 0.050470588235294114,
    variableRate: 0.0037647058823529413,
    utilization: 8,
  },
  {
    stableRate: 0.0505,
    variableRate: 0.004,
    utilization: 8.5,
  },
  {
    stableRate: 0.050529411764705885,
    variableRate: 0.0042352941176470585,
    utilization: 9,
  },
  {
    stableRate: 0.05055882352941177,
    variableRate: 0.004470588235294118,
    utilization: 9.5,
  },
  {
    stableRate: 0.05058823529411765,
    variableRate: 0.004705882352941176,
    utilization: 10,
  },
  {
    stableRate: 0.05061764705882353,
    variableRate: 0.004941176470588235,
    utilization: 10.5,
  },
  {
    stableRate: 0.05064705882352941,
    variableRate: 0.0051764705882352945,
    utilization: 11,
  },
  {
    stableRate: 0.050676470588235295,
    variableRate: 0.005411764705882353,
    utilization: 11.5,
  },
  {
    stableRate: 0.05070588235294118,
    variableRate: 0.005647058823529412,
    utilization: 12,
  },
  {
    stableRate: 0.05073529411764706,
    variableRate: 0.0058823529411764705,
    utilization: 12.5,
  },
  {
    stableRate: 0.05076470588235294,
    variableRate: 0.00611764705882353,
    utilization: 13,
  },
  {
    stableRate: 0.05079411764705882,
    variableRate: 0.006352941176470588,
    utilization: 13.5,
  },
  {
    stableRate: 0.050823529411764705,
    variableRate: 0.006588235294117647,
    utilization: 14,
  },
  {
    stableRate: 0.05085294117647059,
    variableRate: 0.006823529411764706,
    utilization: 14.5,
  },
  {
    stableRate: 0.05088235294117647,
    variableRate: 0.007058823529411765,
    utilization: 15,
  },
  {
    stableRate: 0.05091176470588235,
    variableRate: 0.007294117647058823,
    utilization: 15.5,
  },
  {
    stableRate: 0.05094117647058823,
    variableRate: 0.0075294117647058826,
    utilization: 16,
  },
  {
    stableRate: 0.050970588235294115,
    variableRate: 0.007764705882352941,
    utilization: 16.5,
  },
  {
    stableRate: 0.051,
    variableRate: 0.008,
    utilization: 17,
  },
  {
    stableRate: 0.051029411764705886,
    variableRate: 0.00823529411764706,
    utilization: 17.5,
  },
  {
    stableRate: 0.05105882352941177,
    variableRate: 0.008470588235294117,
    utilization: 18,
  },
  {
    stableRate: 0.05108823529411765,
    variableRate: 0.008705882352941176,
    utilization: 18.5,
  },
  {
    stableRate: 0.05111764705882353,
    variableRate: 0.008941176470588235,
    utilization: 19,
  },
  {
    stableRate: 0.051147058823529414,
    variableRate: 0.009176470588235295,
    utilization: 19.5,
  },
  {
    stableRate: 0.051176470588235295,
    variableRate: 0.009411764705882352,
    utilization: 20,
  },
  {
    stableRate: 0.05120588235294118,
    variableRate: 0.009647058823529411,
    utilization: 20.5,
  },
  {
    stableRate: 0.05123529411764706,
    variableRate: 0.00988235294117647,
    utilization: 21,
  },
  {
    stableRate: 0.05126470588235294,
    variableRate: 0.01011764705882353,
    utilization: 21.5,
  },
  {
    stableRate: 0.05129411764705882,
    variableRate: 0.010352941176470589,
    utilization: 22,
  },
  {
    stableRate: 0.051323529411764705,
    variableRate: 0.010588235294117647,
    utilization: 22.5,
  },
  {
    stableRate: 0.05135294117647059,
    variableRate: 0.010823529411764706,
    utilization: 23,
  },
  {
    stableRate: 0.05138235294117647,
    variableRate: 0.011058823529411765,
    utilization: 23.5,
  },
  {
    stableRate: 0.05141176470588235,
    variableRate: 0.011294117647058824,
    utilization: 24,
  },
  {
    stableRate: 0.05144117647058823,
    variableRate: 0.011529411764705882,
    utilization: 24.5,
  },
  {
    stableRate: 0.051470588235294115,
    variableRate: 0.011764705882352941,
    utilization: 25,
  },
  {
    stableRate: 0.0515,
    variableRate: 0.012,
    utilization: 25.5,
  },
  {
    stableRate: 0.05152941176470588,
    variableRate: 0.01223529411764706,
    utilization: 26,
  },
  {
    stableRate: 0.05155882352941177,
    variableRate: 0.012470588235294117,
    utilization: 26.5,
  },
  {
    stableRate: 0.05158823529411765,
    variableRate: 0.012705882352941176,
    utilization: 27,
  },
  {
    stableRate: 0.05161764705882353,
    variableRate: 0.012941176470588235,
    utilization: 27.5,
  },
  {
    stableRate: 0.051647058823529414,
    variableRate: 0.013176470588235295,
    utilization: 28,
  },
  {
    stableRate: 0.051676470588235296,
    variableRate: 0.013411764705882352,
    utilization: 28.5,
  },
  {
    stableRate: 0.05170588235294118,
    variableRate: 0.013647058823529411,
    utilization: 29,
  },
  {
    stableRate: 0.05173529411764706,
    variableRate: 0.01388235294117647,
    utilization: 29.5,
  },
  {
    stableRate: 0.05176470588235294,
    variableRate: 0.01411764705882353,
    utilization: 30,
  },
  {
    stableRate: 0.051794117647058824,
    variableRate: 0.014352941176470587,
    utilization: 30.5,
  },
  {
    stableRate: 0.051823529411764706,
    variableRate: 0.014588235294117647,
    utilization: 31,
  },
  {
    stableRate: 0.05185294117647059,
    variableRate: 0.014823529411764706,
    utilization: 31.5,
  },
  {
    stableRate: 0.05188235294117647,
    variableRate: 0.015058823529411765,
    utilization: 32,
  },
  {
    stableRate: 0.05191176470588235,
    variableRate: 0.015294117647058824,
    utilization: 32.5,
  },
  {
    stableRate: 0.051941176470588234,
    variableRate: 0.015529411764705882,
    utilization: 33,
  },
  {
    stableRate: 0.051970588235294116,
    variableRate: 0.01576470588235294,
    utilization: 33.5,
  },
  {
    stableRate: 0.052,
    variableRate: 0.016,
    utilization: 34,
  },
  {
    stableRate: 0.05202941176470588,
    variableRate: 0.01623529411764706,
    utilization: 34.5,
  },
  {
    stableRate: 0.05205882352941176,
    variableRate: 0.01647058823529412,
    utilization: 35,
  },
  {
    stableRate: 0.05208823529411765,
    variableRate: 0.016705882352941178,
    utilization: 35.5,
  },
  {
    stableRate: 0.05211764705882353,
    variableRate: 0.016941176470588234,
    utilization: 36,
  },
  {
    stableRate: 0.052147058823529414,
    variableRate: 0.017176470588235293,
    utilization: 36.5,
  },
  {
    stableRate: 0.052176470588235296,
    variableRate: 0.017411764705882352,
    utilization: 37,
  },
  {
    stableRate: 0.05220588235294118,
    variableRate: 0.01764705882352941,
    utilization: 37.5,
  },
  {
    stableRate: 0.05223529411764706,
    variableRate: 0.01788235294117647,
    utilization: 38,
  },
  {
    stableRate: 0.05226470588235294,
    variableRate: 0.01811764705882353,
    utilization: 38.5,
  },
  {
    stableRate: 0.052294117647058824,
    variableRate: 0.01835294117647059,
    utilization: 39,
  },
  {
    stableRate: 0.052323529411764706,
    variableRate: 0.01858823529411765,
    utilization: 39.5,
  },
  {
    stableRate: 0.05235294117647059,
    variableRate: 0.018823529411764704,
    utilization: 40,
  },
  {
    stableRate: 0.05238235294117647,
    variableRate: 0.019058823529411763,
    utilization: 40.5,
  },
  {
    stableRate: 0.05241176470588235,
    variableRate: 0.019294117647058823,
    utilization: 41,
  },
  {
    stableRate: 0.052441176470588234,
    variableRate: 0.019529411764705882,
    utilization: 41.5,
  },
  {
    stableRate: 0.052470588235294116,
    variableRate: 0.01976470588235294,
    utilization: 42,
  },
  {
    stableRate: 0.0525,
    variableRate: 0.02,
    utilization: 42.5,
  },
  {
    stableRate: 0.05252941176470588,
    variableRate: 0.02023529411764706,
    utilization: 43,
  },
  {
    stableRate: 0.05255882352941176,
    variableRate: 0.02047058823529412,
    utilization: 43.5,
  },
  {
    stableRate: 0.052588235294117644,
    variableRate: 0.020705882352941178,
    utilization: 44,
  },
  {
    stableRate: 0.05261764705882353,
    variableRate: 0.020941176470588234,
    utilization: 44.5,
  },
  {
    stableRate: 0.052647058823529415,
    variableRate: 0.021176470588235293,
    utilization: 45,
  },
  {
    stableRate: 0.0526764705882353,
    variableRate: 0.021411764705882352,
    utilization: 45.5,
  },
  {
    stableRate: 0.05270588235294118,
    variableRate: 0.02164705882352941,
    utilization: 46,
  },
  {
    stableRate: 0.05273529411764706,
    variableRate: 0.02188235294117647,
    utilization: 46.5,
  },
  {
    stableRate: 0.05276470588235294,
    variableRate: 0.02211764705882353,
    utilization: 47,
  },
  {
    stableRate: 0.052794117647058825,
    variableRate: 0.02235294117647059,
    utilization: 47.5,
  },
  {
    stableRate: 0.05282352941176471,
    variableRate: 0.02258823529411765,
    utilization: 48,
  },
  {
    stableRate: 0.05285294117647059,
    variableRate: 0.022823529411764704,
    utilization: 48.5,
  },
  {
    stableRate: 0.05288235294117647,
    variableRate: 0.023058823529411764,
    utilization: 49,
  },
  {
    stableRate: 0.05291176470588235,
    variableRate: 0.023294117647058823,
    utilization: 49.5,
  },
  {
    stableRate: 0.052941176470588235,
    variableRate: 0.023529411764705882,
    utilization: 50,
  },
  {
    stableRate: 0.052970588235294117,
    variableRate: 0.02376470588235294,
    utilization: 50.5,
  },
  {
    stableRate: 0.053,
    variableRate: 0.024,
    utilization: 51,
  },
  {
    stableRate: 0.05302941176470588,
    variableRate: 0.02423529411764706,
    utilization: 51.5,
  },
  {
    stableRate: 0.05305882352941176,
    variableRate: 0.02447058823529412,
    utilization: 52,
  },
  {
    stableRate: 0.053088235294117644,
    variableRate: 0.024705882352941175,
    utilization: 52.5,
  },
  {
    stableRate: 0.053117647058823526,
    variableRate: 0.024941176470588234,
    utilization: 53,
  },
  {
    stableRate: 0.05314705882352941,
    variableRate: 0.025176470588235293,
    utilization: 53.5,
  },
  {
    stableRate: 0.0531764705882353,
    variableRate: 0.025411764705882352,
    utilization: 54,
  },
  {
    stableRate: 0.05320588235294118,
    variableRate: 0.02564705882352941,
    utilization: 54.5,
  },
  {
    stableRate: 0.05323529411764706,
    variableRate: 0.02588235294117647,
    utilization: 55,
  },
  {
    stableRate: 0.05326470588235294,
    variableRate: 0.02611764705882353,
    utilization: 55.5,
  },
  {
    stableRate: 0.053294117647058825,
    variableRate: 0.02635294117647059,
    utilization: 56,
  },
  {
    stableRate: 0.05332352941176471,
    variableRate: 0.02658823529411765,
    utilization: 56.5,
  },
  {
    stableRate: 0.05335294117647059,
    variableRate: 0.026823529411764704,
    utilization: 57,
  },
  {
    stableRate: 0.05338235294117647,
    variableRate: 0.027058823529411764,
    utilization: 57.5,
  },
  {
    stableRate: 0.05341176470588235,
    variableRate: 0.027294117647058823,
    utilization: 58,
  },
  {
    stableRate: 0.053441176470588235,
    variableRate: 0.027529411764705882,
    utilization: 58.5,
  },
  {
    stableRate: 0.05347058823529412,
    variableRate: 0.02776470588235294,
    utilization: 59,
  },
  {
    stableRate: 0.0535,
    variableRate: 0.028,
    utilization: 59.5,
  },
  {
    stableRate: 0.05352941176470588,
    variableRate: 0.02823529411764706,
    utilization: 60,
  },
  {
    stableRate: 0.05355882352941176,
    variableRate: 0.02847058823529412,
    utilization: 60.5,
  },
  {
    stableRate: 0.053588235294117645,
    variableRate: 0.028705882352941175,
    utilization: 61,
  },
  {
    stableRate: 0.05361764705882353,
    variableRate: 0.028941176470588234,
    utilization: 61.5,
  },
  {
    stableRate: 0.05364705882352941,
    variableRate: 0.029176470588235293,
    utilization: 62,
  },
  {
    stableRate: 0.05367647058823529,
    variableRate: 0.029411764705882353,
    utilization: 62.5,
  },
  {
    stableRate: 0.05370588235294118,
    variableRate: 0.029647058823529412,
    utilization: 63,
  },
  {
    stableRate: 0.05373529411764706,
    variableRate: 0.02988235294117647,
    utilization: 63.5,
  },
  {
    stableRate: 0.053764705882352944,
    variableRate: 0.03011764705882353,
    utilization: 64,
  },
  {
    stableRate: 0.053794117647058826,
    variableRate: 0.03035294117647059,
    utilization: 64.5,
  },
  {
    stableRate: 0.05382352941176471,
    variableRate: 0.03058823529411765,
    utilization: 65,
  },
  {
    stableRate: 0.05385294117647059,
    variableRate: 0.030823529411764704,
    utilization: 65.5,
  },
  {
    stableRate: 0.05388235294117647,
    variableRate: 0.031058823529411764,
    utilization: 66,
  },
  {
    stableRate: 0.053911764705882353,
    variableRate: 0.031294117647058826,
    utilization: 66.5,
  },
  {
    stableRate: 0.053941176470588235,
    variableRate: 0.03152941176470588,
    utilization: 67,
  },
  {
    stableRate: 0.05397058823529412,
    variableRate: 0.03176470588235294,
    utilization: 67.5,
  },
  {
    stableRate: 0.054,
    variableRate: 0.032,
    utilization: 68,
  },
  {
    stableRate: 0.05402941176470588,
    variableRate: 0.032235294117647056,
    utilization: 68.5,
  },
  {
    stableRate: 0.05405882352941176,
    variableRate: 0.03247058823529412,
    utilization: 69,
  },
  {
    stableRate: 0.054088235294117645,
    variableRate: 0.032705882352941175,
    utilization: 69.5,
  },
  {
    stableRate: 0.05411764705882353,
    variableRate: 0.03294117647058824,
    utilization: 70,
  },
  {
    stableRate: 0.05414705882352941,
    variableRate: 0.03317647058823529,
    utilization: 70.5,
  },
  {
    stableRate: 0.05417647058823529,
    variableRate: 0.033411764705882356,
    utilization: 71,
  },
  {
    stableRate: 0.05420588235294117,
    variableRate: 0.03364705882352941,
    utilization: 71.5,
  },
  {
    stableRate: 0.05423529411764706,
    variableRate: 0.03388235294117647,
    utilization: 72,
  },
  {
    stableRate: 0.054264705882352944,
    variableRate: 0.03411764705882353,
    utilization: 72.5,
  },
  {
    stableRate: 0.054294117647058826,
    variableRate: 0.034352941176470586,
    utilization: 73,
  },
  {
    stableRate: 0.05432352941176471,
    variableRate: 0.03458823529411765,
    utilization: 73.5,
  },
  {
    stableRate: 0.05435294117647059,
    variableRate: 0.034823529411764705,
    utilization: 74,
  },
  {
    stableRate: 0.05438235294117647,
    variableRate: 0.03505882352941177,
    utilization: 74.5,
  },
  {
    stableRate: 0.054411764705882354,
    variableRate: 0.03529411764705882,
    utilization: 75,
  },
  {
    stableRate: 0.054441176470588236,
    variableRate: 0.035529411764705886,
    utilization: 75.5,
  },
  {
    stableRate: 0.05447058823529412,
    variableRate: 0.03576470588235294,
    utilization: 76,
  },
  {
    stableRate: 0.0545,
    variableRate: 0.036,
    utilization: 76.5,
  },
  {
    stableRate: 0.05452941176470588,
    variableRate: 0.03623529411764706,
    utilization: 77,
  },
  {
    stableRate: 0.054558823529411764,
    variableRate: 0.036470588235294116,
    utilization: 77.5,
  },
  {
    stableRate: 0.054588235294117646,
    variableRate: 0.03670588235294118,
    utilization: 78,
  },
  {
    stableRate: 0.05461764705882353,
    variableRate: 0.036941176470588234,
    utilization: 78.5,
  },
  {
    stableRate: 0.05464705882352941,
    variableRate: 0.0371764705882353,
    utilization: 79,
  },
  {
    stableRate: 0.05467647058823529,
    variableRate: 0.03741176470588235,
    utilization: 79.5,
  },
  {
    stableRate: 0.054705882352941174,
    variableRate: 0.03764705882352941,
    utilization: 80,
  },
  {
    stableRate: 0.054735294117647056,
    variableRate: 0.03788235294117647,
    utilization: 80.5,
  },
  {
    stableRate: 0.054764705882352945,
    variableRate: 0.03811764705882353,
    utilization: 81,
  },
  {
    stableRate: 0.054794117647058826,
    variableRate: 0.03835294117647059,
    utilization: 81.5,
  },
  {
    stableRate: 0.05482352941176471,
    variableRate: 0.038588235294117645,
    utilization: 82,
  },
  {
    stableRate: 0.05485294117647059,
    variableRate: 0.03882352941176471,
    utilization: 82.5,
  },
  {
    stableRate: 0.05488235294117647,
    variableRate: 0.039058823529411764,
    utilization: 83,
  },
  {
    stableRate: 0.054911764705882354,
    variableRate: 0.03929411764705883,
    utilization: 83.5,
  },
  {
    stableRate: 0.054941176470588236,
    variableRate: 0.03952941176470588,
    utilization: 84,
  },
  {
    stableRate: 0.05497058823529412,
    variableRate: 0.03976470588235294,
    utilization: 84.5,
  },
  {
    stableRate: 0.055,
    variableRate: 0.04,
    utilization: 85,
  },
  {
    stableRate: 0.075,
    variableRate: 0.06,
    utilization: 85.5,
  },
  {
    stableRate: 0.095,
    variableRate: 0.08,
    utilization: 86,
  },
  {
    stableRate: 0.115,
    variableRate: 0.1,
    utilization: 86.5,
  },
  {
    stableRate: 0.135,
    variableRate: 0.12,
    utilization: 87,
  },
  {
    stableRate: 0.155,
    variableRate: 0.14,
    utilization: 87.5,
  },
  {
    stableRate: 0.175,
    variableRate: 0.16,
    utilization: 88,
  },
  {
    stableRate: 0.195,
    variableRate: 0.18,
    utilization: 88.5,
  },
  {
    stableRate: 0.215,
    variableRate: 0.2,
    utilization: 89,
  },
  {
    stableRate: 0.235,
    variableRate: 0.22,
    utilization: 89.5,
  },
  {
    stableRate: 0.255,
    variableRate: 0.24,
    utilization: 90,
  },
  {
    stableRate: 0.275,
    variableRate: 0.26,
    utilization: 90.5,
  },
  {
    stableRate: 0.295,
    variableRate: 0.28,
    utilization: 91,
  },
  {
    stableRate: 0.315,
    variableRate: 0.3,
    utilization: 91.5,
  },
  {
    stableRate: 0.335,
    variableRate: 0.32,
    utilization: 92,
  },
  {
    stableRate: 0.355,
    variableRate: 0.34,
    utilization: 92.5,
  },
  {
    stableRate: 0.375,
    variableRate: 0.36,
    utilization: 93,
  },
  {
    stableRate: 0.395,
    variableRate: 0.38,
    utilization: 93.5,
  },
  {
    stableRate: 0.415,
    variableRate: 0.4,
    utilization: 94,
  },
  {
    stableRate: 0.435,
    variableRate: 0.42,
    utilization: 94.5,
  },
  {
    stableRate: 0.455,
    variableRate: 0.44,
    utilization: 95,
  },
  {
    stableRate: 0.475,
    variableRate: 0.46,
    utilization: 95.5,
  },
  {
    stableRate: 0.495,
    variableRate: 0.48,
    utilization: 96,
  },
  {
    stableRate: 0.515,
    variableRate: 0.5,
    utilization: 96.5,
  },
  {
    stableRate: 0.535,
    variableRate: 0.52,
    utilization: 97,
  },
  {
    stableRate: 0.555,
    variableRate: 0.54,
    utilization: 97.5,
  },
  {
    stableRate: 0.575,
    variableRate: 0.56,
    utilization: 98,
  },
  {
    stableRate: 0.595,
    variableRate: 0.58,
    utilization: 98.5,
  },
  {
    stableRate: 0.615,
    variableRate: 0.6,
    utilization: 99,
  },
  {
    stableRate: 0.635,
    variableRate: 0.62,
    utilization: 99.5,
  },
  {
    stableRate: 0.655,
    variableRate: 0.64,
    utilization: 100,
  },
]
