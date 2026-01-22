"use client";

import { formatCurrency } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function OrderHistoryList({ orders }: { orders: any[] }) {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Você ainda não realizou nenhum pedido.
      </div>
    );
  }

  // Group orders by date
  const groupedOrders = orders.reduce(
    (groups, order) => {
      const date = new Date(order.createdAt);
      const dateKey = date.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      // Capitalize first letter of weekday
      const formattedDate = dateKey.charAt(0).toUpperCase() + dateKey.slice(1);

      if (!groups[formattedDate]) {
        groups[formattedDate] = [];
      }
      groups[formattedDate].push(order);
      return groups;
    },
    {} as Record<string, typeof orders>,
  );

  const handleReorder = (order: any) => {
    if (order.company?.slug) {
      const reorderData = {
        items: order.items,
        companyId: order.companyId,
      };
      localStorage.setItem("pendingReorder", JSON.stringify(reorderData));
      router.push(`/${order.company.slug}`);
    }
  };

  return (
    <>
      <div className="space-y-8">
        {Object.entries(groupedOrders).map(([date, groupOrders]) => (
          <div key={date}>
            <h2 className="text-lg font-medium text-gray-500 mb-4">{date}</h2>
            <div className="space-y-4">
              {groupOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border shadow-sm p-4"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {order.company?.profileImage ? (
                        <Image
                          src={order.company.profileImage}
                          alt={order.company.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                          {order.company?.name?.charAt(0) || "R"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">
                        {order.company?.name || "Restaurante"}
                      </h3>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        {order.status === "delivered" ||
                        order.status === "completed" ? (
                          <>
                            <span className="text-green-600">
                              Pedido concluído
                            </span>
                            <CheckCircle2 className="h-4 w-4 fill-green-600 text-white" />
                          </>
                        ) : (
                          <span className="text-muted-foreground">
                            {order.status === "cancelled"
                              ? "Cancelado"
                              : "Em andamento"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="flex justify-between items-center mb-4 pl-[3.25rem]">
                    <div className="flex items-center gap-3 text-sm text-gray-700 flex-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600 min-w-[1.5rem] text-center">
                        {order.items[0]?.quantity}
                      </span>
                      <span className="line-clamp-2">
                        {order.items[0]?.productName}
                        {order.items.length > 1 &&
                          ` + ${order.items.length - 1} itens`}
                      </span>
                    </div>
                    {order.items[0]?.productImage && (
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ml-2">
                        <Image
                          src={order.items[0].productImage}
                          alt={order.items[0].productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t pt-2 gap-4">
                    <Button
                      variant="ghost"
                      className="flex-1 text-primary hover:text-primary hover:bg-primary/5"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Detalhes
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 text-primary font-bold hover:text-primary hover:bg-primary/5"
                      onClick={() => handleReorder(order)}
                    >
                      Adicione à sacola
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status and Date */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  {new Date(selectedOrder.createdAt).toLocaleString("pt-BR")}
                </span>
                <span className="font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  #{selectedOrder.id.slice(0, 8)}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <div className="font-medium text-muted-foreground w-6 pt-0.5">
                      {item.quantity}x
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                      {item.selectedFlavors &&
                        item.selectedFlavors.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {item.selectedFlavors.join(", ")}
                          </p>
                        )}
                      {item.selectedFlavor && !item.selectedFlavors && (
                        <p className="text-sm text-muted-foreground">
                          {item.selectedFlavor}
                        </p>
                      )}
                      {item.comboItems && item.comboItems.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {item.comboItems.map((ci: string, i: number) => (
                            <div key={i}>• {ci}</div>
                          ))}
                        </div>
                      )}
                      {item.removedIngredients &&
                        item.removedIngredients.length > 0 && (
                          <p className="text-sm text-red-500">
                            Sem: {item.removedIngredients.join(", ")}
                          </p>
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-secondary/20 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium">Pagamento:</span>
                  <span className="capitalize">
                    {selectedOrder.paymentMethod === "pix"
                      ? "Pix"
                      : selectedOrder.paymentMethod === "credit"
                        ? "Crédito"
                        : selectedOrder.paymentMethod === "debit"
                          ? "Débito"
                          : selectedOrder.paymentMethod === "cash"
                            ? "Dinheiro"
                            : selectedOrder.paymentMethod}
                  </span>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div>
                    <span className="font-medium block mb-1">Entrega em:</span>
                    <p className="text-muted-foreground">
                      {selectedOrder.deliveryAddress.street},{" "}
                      {selectedOrder.deliveryAddress.number}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.deliveryAddress.neighborhood} -{" "}
                      {selectedOrder.deliveryAddress.city}/
                      {selectedOrder.deliveryAddress.state}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2">
                <Button
                  className="w-full font-bold"
                  onClick={() => handleReorder(selectedOrder)}
                >
                  Adicione à sacola novamente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
