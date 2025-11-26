import argparse
import os
import torch
import pandas as pd
from model import PoseRAC


def export_onnx(
    weights_path: str,
    output_path: str,
    dim: int = 99,
    heads: int = 9,
    enc_layer: int = 6,
    learning_rate: float = 1e-3,
    seed: int = 42,
    alpha: float = 0.01,
    opset: int = 13,
):
    """
    Export PoseRAC PyTorch weights to ONNX for mobile inference.
    """
    # Derive num_classes from all_action.csv
    label_csv = os.path.join(os.path.dirname(__file__), "all_action.csv")
    label_pd = pd.read_csv(label_csv)
    index2action = {row["label"]: row["action"] for _, row in label_pd.iterrows()}
    num_classes = len(index2action)

    # Build model and load weights
    model = PoseRAC(
        None,
        None,
        None,
        None,
        dim=dim,
        heads=heads,
        enc_layer=enc_layer,
        learning_rate=learning_rate,
        seed=seed,
        num_classes=num_classes,
        alpha=alpha,
    )
    state_dict = torch.load(weights_path, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()

    # Dummy input: batch=1, feature=dim
    dummy = torch.randn(1, dim, dtype=torch.float32)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    # Export with dynamic batch axis
    torch.onnx.export(
        model,
        dummy,
        output_path,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=opset,
        do_constant_folding=True,
    )
    print(f"✅ Exported ONNX to: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Export PoseRAC to ONNX")
    parser.add_argument(
        "--weights",
        type=str,
        default=os.path.join(os.path.dirname(__file__), "best_weights_PoseRAC.pth"),
        help="Path to PyTorch weights (.pth)",
    )
    parser.add_argument(
        "--out",
        type=str,
        default=os.path.join(os.path.dirname(__file__), "poserac.onnx"),
        help="Output ONNX file path",
    )
    parser.add_argument("--dim", type=int, default=99)
    parser.add_argument("--heads", type=int, default=9)
    parser.add_argument("--enc_layer", type=int, default=6)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--alpha", type=float, default=0.01)
    parser.add_argument("--opset", type=int, default=13)
    args = parser.parse_args()

    export_onnx(
        weights_path=args.weights,
        output_path=args.out,
        dim=args.dim,
        heads=args.heads,
        enc_layer=args.enc_layer,
        learning_rate=args.lr,
        seed=args.seed,
        alpha=args.alpha,
        opset=args.opset,
    )


if __name__ == "__main__":
    main()


